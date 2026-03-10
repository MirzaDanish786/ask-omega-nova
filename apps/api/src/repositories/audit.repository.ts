import type { Repository } from 'typeorm';
import { AppDataSource } from '../database/data-source.js';
import { AuditLog } from '../entities/index.js';
import { createId } from '../utils/id.js';

export class AuditRepository {
  private repo: Repository<AuditLog>;

  constructor() {
    this.repo = AppDataSource.getRepository(AuditLog);
  }

  async create(data: {
    userId: string;
    action: string;
    resource: string;
    resourceId?: string;
    details?: Record<string, unknown>;
  }): Promise<AuditLog> {
    const entity = this.repo.create({ id: createId(), ...data });
    return this.repo.save(entity);
  }

  async findRecent(limit = 100): Promise<AuditLog[]> {
    return this.repo.find({
      order: { createdAt: 'DESC' },
      take: limit,
      relations: ['user'],
    });
  }
}
