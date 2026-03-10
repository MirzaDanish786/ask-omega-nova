import type { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service.js';
import { SimulationRepository } from '../repositories/simulation.repository.js';
import { OgwiRepository } from '../repositories/ogwi.repository.js';
import { AuditRepository } from '../repositories/audit.repository.js';

const userService = new UserService();
const simRepo = new SimulationRepository();
const ogwiRepo = new OgwiRepository();
const auditRepo = new AuditRepository();

export class AdminController {
  static async getStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const [userStats, simCount, ogwiCount] = await Promise.all([
        userService.getStats(),
        simRepo.count(),
        ogwiRepo.getRecentCount(30),
      ]);
      res.json({
        users: userStats.totalUsers,
        simulations: simCount,
        ogwiUpdates30d: ogwiCount,
      });
    } catch (err) { next(err); }
  }

  static async getAuditLogs(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const logs = await auditRepo.findRecent();
      res.json(logs);
    } catch (err) { next(err); }
  }
}
