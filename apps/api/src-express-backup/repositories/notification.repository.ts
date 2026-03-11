import type { Repository } from 'typeorm';
import { AppDataSource } from '../database/data-source.js';
import { Notification } from '../entities/index.js';
import { createId } from '../utils/id.js';

export class NotificationRepository {
  private repo: Repository<Notification>;

  constructor() {
    this.repo = AppDataSource.getRepository(Notification);
  }

  async findByUserId(userId: string, limit = 50): Promise<Notification[]> {
    return this.repo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async markAsRead(id: string): Promise<Notification> {
    await this.repo.update(id, { read: true });
    return this.repo.findOneOrFail({ where: { id } });
  }

  async create(data: {
    userId: string;
    type: string;
    severity: string;
    title: string;
    message: string;
  }): Promise<Notification> {
    const entity = this.repo.create({ id: createId(), ...data });
    return this.repo.save(entity);
  }

  async unreadCount(userId: string): Promise<number> {
    return this.repo.count({ where: { userId, read: false } });
  }
}
