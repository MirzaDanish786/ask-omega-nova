import { Injectable, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgentConfig, AgentAuditLog, AgentStatus } from '../../entities/index.js';
import { createId } from '../../utils/id.js';

@Injectable()
export class AgentsService {
  constructor(
    @InjectRepository(AgentConfig)
    private readonly configRepo: Repository<AgentConfig>,
    @InjectRepository(AgentAuditLog)
    private readonly auditRepo: Repository<AgentAuditLog>,
  ) {}

  async getAll(): Promise<AgentConfig[]> {
    return this.configRepo.find({ order: { createdAt: 'ASC' } });
  }

  async toggle(agentId: string, enabled: boolean): Promise<AgentConfig> {
    const agent = await this.configRepo.findOne({ where: { agentId } });
    if (!agent) throw new NotFoundException('Agent not found');
    await this.configRepo.update(
      { agentId },
      { enabled, status: enabled ? AgentStatus.ACTIVE : AgentStatus.DISABLED },
    );
    return this.configRepo.findOneOrFail({ where: { agentId } });
  }

  async manualRun(agentId: string): Promise<{ message: string; durationMs: number }> {
    const agent = await this.configRepo.findOne({ where: { agentId } });
    if (!agent) throw new NotFoundException('Agent not found');
    if (!agent.enabled) throw new HttpException('Agent is disabled', HttpStatus.BAD_REQUEST);

    const start = Date.now();
    try {
      await this.configRepo.update({ agentId }, { status: AgentStatus.ACTIVE, lastRunAt: new Date() });
      const durationMs = Date.now() - start;
      const auditEntity = this.auditRepo.create({
        id: createId(),
        agentId,
        action: 'manual_run',
        status: 'success',
        durationMs,
      });
      await this.auditRepo.save(auditEntity);
      return { message: `Agent ${agentId} executed successfully`, durationMs };
    } catch (err) {
      const durationMs = Date.now() - start;
      const error = err instanceof Error ? err.message : 'Unknown error';
      await this.configRepo
        .createQueryBuilder()
        .update(AgentConfig)
        .set({
          status: AgentStatus.ERROR,
          lastRunAt: new Date(),
          errorCount: () => '"errorCount" + 1',
        })
        .where('agentId = :agentId', { agentId })
        .execute();
      const auditEntity = this.auditRepo.create({
        id: createId(),
        agentId,
        action: 'manual_run',
        status: 'error',
        durationMs,
        error,
      });
      await this.auditRepo.save(auditEntity);
      throw new HttpException(`Agent run failed: ${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getAuditLogs(agentId: string): Promise<AgentAuditLog[]> {
    return this.auditRepo.find({
      where: { agentId },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }
}
