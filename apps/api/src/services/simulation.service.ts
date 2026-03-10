import { SimulationRepository } from '../repositories/simulation.repository.js';
import { UserRepository } from '../repositories/user.repository.js';
import { KnowledgeService } from './knowledge.service.js';
import { OgwiService } from './ogwi.service.js';
import { openai, ASSISTANT_ID } from '../config/openai.js';
import { AppError } from '../interfaces/base.js';
import type { Simulation } from '@prisma/client';

export class SimulationService {
  private repo = new SimulationRepository();
  private userRepo = new UserRepository();
  private kbService = new KnowledgeService();
  private ogwiService = new OgwiService();

  async getById(id: string): Promise<Simulation> {
    const sim = await this.repo.findById(id);
    if (!sim) throw new AppError(404, 'Simulation not found');
    return sim;
  }

  async getByUserId(userId: string): Promise<Simulation[]> {
    return this.repo.findByUserId(userId);
  }

  async create(userId: string, query: string): Promise<Simulation> {
    if (!openai) throw new AppError(503, 'OpenAI not configured');

    // Check rate limit
    const user = await this.userRepo.findById(userId);
    if (!user) throw new AppError(404, 'User not found');
    if (user.monthlySimCount >= user.simRateLimit) {
      throw new AppError(429, 'Monthly simulation limit reached');
    }

    // Get OGWI snapshot
    const current = await this.ogwiService.getCurrent();

    // Create simulation record
    const sim = await this.repo.create({
      userId,
      query: query.slice(0, 12000),
      ogwiSnapshot: current.ogwiScore,
    });

    // Run async — update status as we go
    this.runSimulation(sim.id, query, userId, user.role).catch(err => {
      console.error('Simulation run failed:', err);
    });

    await this.userRepo.incrementSimCount(userId);
    return sim;
  }

  async continueThread(simId: string, userId: string, message: string): Promise<Simulation> {
    if (!openai) throw new AppError(503, 'OpenAI not configured');

    const sim = await this.getById(simId);
    if (sim.userId !== userId) throw new AppError(403, 'Not your simulation');
    if (!sim.threadId) throw new AppError(400, 'No thread to continue');

    await this.repo.update(simId, { status: 'RUNNING' });

    try {
      const answer = await this.executeAssistantRun(sim.threadId, message);
      const sanitized = this.sanitizeAnswer(answer.text);

      await this.repo.update(simId, {
        status: 'COMPLETED',
        answer: sanitized,
        tokensUsed: (sim.tokensUsed ?? 0) + (answer.tokensUsed ?? 0),
      });
    } catch (err) {
      await this.repo.update(simId, { status: 'FAILED' });
      throw err;
    }

    return this.getById(simId);
  }

  private async runSimulation(simId: string, query: string, userId: string, userRole: string): Promise<void> {
    try {
      await this.repo.update(simId, { status: 'RUNNING' });

      // KB context injection
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

      // Create thread and run
      const thread = await openai!.beta.threads.create();
      await openai!.beta.threads.messages.create(thread.id, {
        role: 'user',
        content: enrichedMessage,
      });

      const answer = await this.executeAssistantRun(thread.id, enrichedMessage, true);
      const sanitized = this.sanitizeAnswer(answer.text);

      await this.repo.update(simId, {
        status: 'COMPLETED',
        threadId: thread.id,
        answer: sanitized,
        tokensUsed: answer.tokensUsed ?? 0,
        kbArticlesUsed: articlesUsed,
      });
    } catch (err) {
      console.error('Simulation error:', err);
      await this.repo.update(simId, { status: 'FAILED' });
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

    // Poll for completion (90s timeout)
    const startTime = Date.now();
    while (run.status === 'queued' || run.status === 'in_progress') {
      if (Date.now() - startTime > 90000) {
        throw new AppError(504, 'OpenAI run timeout');
      }
      await new Promise(resolve => setTimeout(resolve, 1200));
      run = await openai!.beta.threads.runs.retrieve(threadId, run.id);
    }

    if (run.status !== 'completed') {
      throw new AppError(502, `Assistant run failed with status: ${run.status}`);
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

      // Remove legacy section headers
      const headerRx = /^(?:\s*(?:#{1,6}\s*)?(?:\d+\.\s*)?)?(Situational Synthesis|What It Means|What to Watch|Follow-?up Questions|Red Team(?:\s*[\u2013-]?\s*Consideration)?|Executive Summary|Interpretive Note)\s*[:\-\u2014]?\s*$/gmi;
      out = out.replace(headerRx, '');

      // Strip inline labels
      out = out.replace(/(?:Situational Synthesis|What It Means|What to Watch|Follow-?up Questions|Red Team(?:\s*[\u2013-]?\s*Consideration)?|Executive Summary|Interpretive Note)\s*[:\-\u2014]?\s*/gi, '');

      // Remove risk disclaimers
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
