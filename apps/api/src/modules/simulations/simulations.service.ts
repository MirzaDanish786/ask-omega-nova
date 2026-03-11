import { Injectable, NotFoundException, ForbiddenException, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Simulation, type SimulationStatus } from '../../entities/index.js';
import { UsersService } from '../users/users.service.js';
import { KnowledgeService } from '../knowledge/knowledge.service.js';
import { OgwiService } from '../ogwi/ogwi.service.js';
import { openai, ASSISTANT_ID } from '../../config/openai.js';
import { createId } from '../../utils/id.js';

@Injectable()
export class SimulationsService {
  constructor(
    @InjectRepository(Simulation)
    private readonly repo: Repository<Simulation>,
    private readonly usersService: UsersService,
    private readonly kbService: KnowledgeService,
    private readonly ogwiService: OgwiService,
  ) {}

  async getById(id: string): Promise<Simulation> {
    const sim = await this.repo.findOne({ where: { id } });
    if (!sim) throw new NotFoundException('Simulation not found');
    return sim;
  }

  async getByUserId(userId: string): Promise<Simulation[]> {
    return this.repo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async create(userId: string, query: string): Promise<Simulation> {
    if (!openai) throw new HttpException('OpenAI not configured', HttpStatus.SERVICE_UNAVAILABLE);

    const user = await this.usersService.getById(userId);
    if (user.monthlySimCount >= user.simRateLimit) {
      throw new HttpException('Monthly simulation limit reached', HttpStatus.TOO_MANY_REQUESTS);
    }

    const ogwiScore = await this.ogwiService.getLatestScore();

    const entity = this.repo.create({
      id: createId(),
      userId,
      query: query.slice(0, 12000),
      ogwiSnapshot: ogwiScore,
    });
    const sim = await this.repo.save(entity);

    // Run async
    this.runSimulation(sim.id, query, userId, user.role).catch(err => {
      console.error('Simulation run failed:', err);
    });

    await this.usersService.incrementSimCount(userId);
    return sim;
  }

  async continueThread(simId: string, userId: string, message: string): Promise<Simulation> {
    if (!openai) throw new HttpException('OpenAI not configured', HttpStatus.SERVICE_UNAVAILABLE);

    const sim = await this.getById(simId);
    if (sim.userId !== userId) throw new ForbiddenException('Not your simulation');
    if (!sim.threadId) throw new HttpException('No thread to continue', HttpStatus.BAD_REQUEST);

    await this.repo.update(simId, { status: 'RUNNING' as SimulationStatus });

    try {
      const answer = await this.executeAssistantRun(sim.threadId, message);
      const sanitized = this.sanitizeAnswer(answer.text);

      await this.repo.update(simId, {
        status: 'COMPLETED' as SimulationStatus,
        answer: sanitized,
        tokensUsed: (sim.tokensUsed ?? 0) + (answer.tokensUsed ?? 0),
      });
    } catch (err) {
      await this.repo.update(simId, { status: 'FAILED' as SimulationStatus });
      throw err;
    }

    return this.getById(simId);
  }

  async count(): Promise<number> {
    return this.repo.count();
  }

  private async runSimulation(simId: string, query: string, userId: string, userRole: string): Promise<void> {
    try {
      await this.repo.update(simId, { status: 'RUNNING' as SimulationStatus });

      const relevantIds = this.kbService.findRelevantArticleIds(query);
      let kbContext = '';
      const articlesUsed: string[] = [];

      if (relevantIds.length > 0) {
        const articles = await this.kbService.getArticlesByIds(relevantIds);
        const limited = articles.slice(0, 3);
        const userLevel = userRole === 'ADMIN' || userRole === 'ALL_ACCESS' ? 'advanced' : 'standard';
        kbContext = this.kbService.buildKBContext(limited, userLevel);
        articlesUsed.push(...limited.map(a => a.id));
      }

      const enrichedMessage = kbContext ? `${query}\n${kbContext}` : query;

      const thread = await openai!.beta.threads.create();
      await openai!.beta.threads.messages.create(thread.id, {
        role: 'user',
        content: enrichedMessage,
      });

      const answer = await this.executeAssistantRun(thread.id, enrichedMessage, true);
      const sanitized = this.sanitizeAnswer(answer.text);

      await this.repo.update(simId, {
        status: 'COMPLETED' as SimulationStatus,
        threadId: thread.id,
        answer: sanitized,
        tokensUsed: answer.tokensUsed ?? 0,
        kbArticlesUsed: articlesUsed,
      });
    } catch (err) {
      console.error('Simulation error:', err);
      await this.repo.update(simId, { status: 'FAILED' as SimulationStatus });
    }
  }

  private async executeAssistantRun(
    threadId: string,
    message: string,
    skipMessageCreate = false,
  ): Promise<{ text: string; tokensUsed: number | null }> {
    if (!skipMessageCreate) {
      await openai!.beta.threads.messages.create(threadId, {
        role: 'user',
        content: message,
      });
    }

    let run = await openai!.beta.threads.runs.create(threadId, {
      assistant_id: ASSISTANT_ID,
    });

    const startTime = Date.now();
    while (run.status === 'queued' || run.status === 'in_progress') {
      if (Date.now() - startTime > 90000) {
        throw new HttpException('OpenAI run timeout', HttpStatus.GATEWAY_TIMEOUT);
      }
      await new Promise(resolve => setTimeout(resolve, 1200));
      run = await openai!.beta.threads.runs.retrieve(threadId, run.id);
    }

    if (run.status !== 'completed') {
      throw new HttpException(`Assistant run failed with status: ${run.status}`, HttpStatus.BAD_GATEWAY);
    }

    const msgs = await openai!.beta.threads.messages.list(threadId);
    const assistantMsg = msgs.data?.[0];
    const text = assistantMsg?.content?.[0]?.type === 'text'
      ? assistantMsg.content[0].text.value
      : '';

    return { text, tokensUsed: run.usage?.total_tokens ?? null };
  }

  sanitizeAnswer(text: string, allowOGWI = false): string {
    try {
      const original = String(text || '');
      let out = original;

      const headerRx = /^(?:\s*(?:#{1,6}\s*)?(?:\d+\.\s*)?)?(Situational Synthesis|What It Means|What to Watch|Follow-?up Questions|Red Team(?:\s*[\u2013-]?\s*Consideration)?|Executive Summary|Interpretive Note)\s*[:\-\u2014]?\s*$/gmi;
      out = out.replace(headerRx, '');

      out = out.replace(/(?:Situational Synthesis|What It Means|What to Watch|Follow-?up Questions|Red Team(?:\s*[\u2013-]?\s*Consideration)?|Executive Summary|Interpretive Note)\s*[:\-\u2014]?\s*/gi, '');

      out = out.replace(/(?:^|\n)\s*(?:>\s*)?(?:\*\*|__)?\s*Note on Risk[:\-]?\s*[\s\S]*?(?=\n{2,}|$)/gi, '');
      out = out.replace(/(?:^|\n)\s*(?:>\s*)?(?:\*\*|__)?\s*Risk disclaimer[:\-]?\s*[\s\S]*?(?=\n{2,}|$)/gi, '');

      if (!allowOGWI) {
        out = out.replace(/\b(OGWI|stability index|regional ogwi|global stability index)\b/gi, '');
        out = out.replace(/^\s*(?:Regional\s+)?OGWI.*$/gmi, '');
      }

      out = out.replace(/\n{3,}/g, '\n\n').trim();

      if (out.length < 40 && original.length > 0) {
        return 'Available data is limited at this time. Please try a more specific query.';
      }

      return out;
    } catch {
      return String(text || '');
    }
  }
}
