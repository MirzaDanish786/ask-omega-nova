import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../../entities/index.js';
import { createId } from '../../utils/id.js';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly repo: Repository<Notification>,
  ) {}

  async getByUserId(userId: string): Promise<Notification[]> {
    return this.repo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 50,
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

  async getUnreadCount(userId: string): Promise<number> {
    return this.repo.count({ where: { userId, read: false } });
  }
}
