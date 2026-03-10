import type { Request, Response, NextFunction } from 'express';
import { NotificationService } from '../services/notification.service.js';

const notifService = new NotificationService();

export class NotificationController {
  static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const notifications = await notifService.getByUserId(req.user!.id);
      res.json(notifications);
    } catch (err) { next(err); }
  }

  static async markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const notification = await notifService.markAsRead(req.params.id as string);
      res.json(notification);
    } catch (err) { next(err); }
  }
}
