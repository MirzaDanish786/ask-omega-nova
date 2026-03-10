import type { Request, Response, NextFunction } from 'express';
import { SimulationService } from '../services/simulation.service.js';

const simService = new SimulationService();

export class SimulationController {
  static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sims = await simService.getByUserId(req.user!.id);
      res.json(sims);
    } catch (err) { next(err); }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sim = await simService.create(req.user!.id, req.body.query);
      res.status(201).json(sim);
    } catch (err) { next(err); }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sim = await simService.getById(req.params.id as string);
      res.json(sim);
    } catch (err) { next(err); }
  }

  static async continueThread(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sim = await simService.continueThread(req.params.id as string, req.user!.id, req.body.message);
      res.json(sim);
    } catch (err) { next(err); }
  }
}
