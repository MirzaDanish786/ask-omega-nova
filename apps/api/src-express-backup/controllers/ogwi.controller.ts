import type { Request, Response, NextFunction } from 'express';
import { OgwiService } from '../services/ogwi.service.js';

const ogwiService = new OgwiService();

export class OgwiController {
  static async getCurrent(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await ogwiService.getCurrent();
      res.json(data);
    } catch (err) { next(err); }
  }

  static async getHistorical(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { from, to, limit } = req.query as Record<string, string>;
      const data = await ogwiService.getHistorical(from, to, limit ? Number(limit) : undefined);
      res.json(data);
    } catch (err) { next(err); }
  }

  static async getForecast(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await ogwiService.getForecast();
      res.json(data);
    } catch (err) { next(err); }
  }

  static async triggerUpdate(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await ogwiService.triggerUpdate();
      res.json({ success: true, ...result });
    } catch (err) { next(err); }
  }
}
