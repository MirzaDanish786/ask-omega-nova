import { prisma } from '../config/database.js';
import type { AgentConfig, AgentAuditLog, AgentStatus } from '@prisma/client';

export class AgentRepository {
  async findAll(): Promise<AgentConfig[]> {
    return prisma.agentConfig.findMany({ orderBy: { createdAt: 'asc' } });
  }

  async findByAgentId(agentId: string): Promise<AgentConfig | null> {
    return prisma.agentConfig.findUnique({ where: { agentId } });
  }

  async toggle(agentId: string, enabled: boolean): Promise<AgentConfig> {
    return prisma.agentConfig.update({
      where: { agentId },
      data: { enabled, status: enabled ? 'ACTIVE' : 'DISABLED' },
    });
  }

  async updateStatus(agentId: string, status: AgentStatus, error?: string): Promise<void> {
    await prisma.agentConfig.update({
      where: { agentId },
      data: {
        status,
        lastRunAt: new Date(),
        ...(error ? { errorCount: { increment: 1 } } : {}),
      },
    });
  }

  async createAuditLog(data: {
    agentId: string;
    action: string;
    status: string;
    durationMs: number;
    error?: string;
  }): Promise<AgentAuditLog> {
    return prisma.agentAuditLog.create({ data });
  }

  async getAuditLogs(agentId: string, limit = 50): Promise<AgentAuditLog[]> {
    return prisma.agentAuditLog.findMany({
      where: { agentId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
