import type { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service.js';

const userService = new UserService();

export class UserController {
  static async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.getById(req.user!.id);
      res.json(user);
    } catch (err) { next(err); }
  }

  static async updateMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.updateProfile(req.user!.id, req.body);
      res.json(user);
    } catch (err) { next(err); }
  }

  static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await userService.getAll();
      res.json(users);
    } catch (err) { next(err); }
  }

  static async updateRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.updateRole(req.params.id as string, req.body.role);
      res.json(user);
    } catch (err) { next(err); }
  }

  static async updateModules(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.updateModules(req.params.id as string, req.body.modules);
      res.json(user);
    } catch (err) { next(err); }
  }
}
