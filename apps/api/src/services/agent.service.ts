import { AgentRepository } from '../repositories/agent.repository.js';
import { AppError } from '../interfaces/base.js';
import type { AgentConfig, AgentAuditLog } from '@prisma/client';

export class AgentService {
  private repo = new AgentRepository();

  async getAll(): Promise<AgentConfig[]> {
    return this.repo.findAll();
  }

  async toggle(agentId: string, enabled: boolean): Promise<AgentConfig> {
    const agent = await this.repo.findByAgentId(agentId);
    if (!agent) throw new AppError(404, 'Agent not found');
    return this.repo.toggle(agentId, enabled);
  }

  async manualRun(agentId: string): Promise<{ message: string; durationMs: number }> {
    const agent = await this.repo.findByAgentId(agentId);
    if (!agent) throw new AppError(404, 'Agent not found');
    if (!agent.enabled) throw new AppError(400, 'Agent is disabled');

    const start = Date.now();
    try {
      await this.repo.updateStatus(agentId, 'ACTIVE');
      // Agent execution would be dispatched here based on agentId
      const durationMs = Date.now() - start;
      await this.repo.createAuditLog({
        agentId,
        action: 'manual_run',
        status: 'success',
        durationMs,
      });
      return { message: `Agent ${agentId} executed successfully`, durationMs };
    } catch (err) {
      const durationMs = Date.now() - start;
      const error = err instanceof Error ? err.message : 'Unknown error';
      await this.repo.updateStatus(agentId, 'ERROR', error);
      await this.repo.createAuditLog({
        agentId,
        action: 'manual_run',
        status: 'error',
        durationMs,
        error,
      });
      throw new AppError(500, `Agent run failed: ${error}`);
    }
  }

  async getAuditLogs(agentId: string): Promise<AgentAuditLog[]> {
    return this.repo.getAuditLogs(agentId);
  }
}
