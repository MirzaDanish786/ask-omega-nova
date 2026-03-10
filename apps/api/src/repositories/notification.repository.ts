import { prisma } from '../config/database.js';
import type { Notification } from '@prisma/client';

export class NotificationRepository {
  async findByUserId(userId: string, limit = 50): Promise<Notification[]> {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async markAsRead(id: string): Promise<Notification> {
    return prisma.notification.update({ where: { id }, data: { read: true } });
  }

  async create(data: {
    userId: string;
    type: string;
    severity: string;
    title: string;
    message: string;
  }): Promise<Notification> {
    return prisma.notification.create({ data });
  }

  async unreadCount(userId: string): Promise<number> {
    return prisma.notification.count({ where: { userId, read: false } });
  }
}
