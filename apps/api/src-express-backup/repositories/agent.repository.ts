import type { Repository } from 'typeorm';
import { AppDataSource } from '../database/data-source.js';
import { AgentConfig, AgentAuditLog, type AgentStatus } from '../entities/index.js';
import { createId } from '../utils/id.js';

export class AgentRepository {
  private configRepo: Repository<AgentConfig>;
  private auditRepo: Repository<AgentAuditLog>;

  constructor() {
    this.configRepo = AppDataSource.getRepository(AgentConfig);
    this.auditRepo = AppDataSource.getRepository(AgentAuditLog);
  }

  async findAll(): Promise<AgentConfig[]> {
    return this.configRepo.find({ order: { createdAt: 'ASC' } });
  }

  async findByAgentId(agentId: string): Promise<AgentConfig | null> {
    return this.configRepo.findOne({ where: { agentId } });
  }

  async toggle(agentId: string, enabled: boolean): Promise<AgentConfig> {
    await this.configRepo.update(
      { agentId },
      { enabled, status: enabled ? ('ACTIVE' as AgentStatus) : ('DISABLED' as AgentStatus) },
    );
    return this.findByAgentId(agentId) as Promise<AgentConfig>;
  }

  async updateStatus(agentId: string, status: AgentStatus, error?: string): Promise<void> {
    const updateData: Partial<AgentConfig> = {
      status,
      lastRunAt: new Date(),
    };

    if (error) {
      await this.configRepo
        .createQueryBuilder()
        .update(AgentConfig)
        .set({
          status,
          lastRunAt: new Date(),
          errorCount: () => '"errorCount" + 1',
        })
        .where('agentId = :agentId', { agentId })
        .execute();
    } else {
      await this.configRepo.update({ agentId }, updateData);
    }
  }

  async createAuditLog(data: {
    agentId: string;
    action: string;
    status: string;
    durationMs: number;
    error?: string;
  }): Promise<AgentAuditLog> {
    const entity = this.auditRepo.create({ id: createId(), ...data });
    return this.auditRepo.save(entity);
  }

  async getAuditLogs(agentId: string, limit = 50): Promise<AgentAuditLog[]> {
    return this.auditRepo.find({
      where: { agentId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
