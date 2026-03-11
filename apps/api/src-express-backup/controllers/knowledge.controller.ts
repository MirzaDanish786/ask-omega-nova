import type { Request, Response, NextFunction } from 'express';
import { KnowledgeService } from '../services/knowledge.service.js';

const kbService = new KnowledgeService();

export class KnowledgeController {
  static async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const q = req.query.q as string;
      if (!q) { res.status(400).json({ error: 'Query parameter q is required' }); return; }
      const articles = await kbService.search(q);
      res.json(articles);
    } catch (err) { next(err); }
  }

  static async getAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const articles = await kbService.getAll();
      res.json(articles);
    } catch (err) { next(err); }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const article = await kbService.create(req.body);
      res.status(201).json(article);
    } catch (err) { next(err); }
  }
}
