import { NotificationRepository } from '../repositories/notification.repository.js';
import type { Notification } from '@prisma/client';

export class NotificationService {
  private repo = new NotificationRepository();

  async getByUserId(userId: string): Promise<Notification[]> {
    return this.repo.findByUserId(userId);
  }

  async markAsRead(id: string): Promise<Notification> {
    return this.repo.markAsRead(id);
  }

  async create(data: {
    userId: string;
    type: string;
    severity: string;
    title: string;
    message: string;
  }): Promise<Notification> {
    return this.repo.create(data);
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.repo.unreadCount(userId);
  }
}
