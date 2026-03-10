import type { Request, Response, NextFunction } from 'express';
import { EarlyWarningRepository } from '../repositories/earlywarning.repository.js';

const ewRepo = new EarlyWarningRepository();

export class EarlyWarningController {
  static async getCurrent(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await ewRepo.getLatestByRegion();
      res.json(data);
    } catch (err) { next(err); }
  }

  static async getHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { region, limit } = req.query as Record<string, string>;
      const data = await ewRepo.getHistory({ region, limit: limit ? Number(limit) : undefined });
      res.json(data);
    } catch (err) { next(err); }
  }
}
