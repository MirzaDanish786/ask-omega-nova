import { prisma } from '../config/database.js';
import type { AuditLog, Prisma } from '@prisma/client';

export class AuditRepository {
  async create(data: {
    userId: string;
    action: string;
    resource: string;
    resourceId?: string;
    details?: Prisma.InputJsonValue;
  }): Promise<AuditLog> {
    return prisma.auditLog.create({ data });
  }

  async findRecent(limit = 100): Promise<AuditLog[]> {
    return prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { user: { select: { email: true, name: true } } },
    });
  }
}
