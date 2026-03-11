import type { Request, Response, NextFunction } from 'express';
import { AgentService } from '../services/agent.service.js';

const agentService = new AgentService();

export class AgentController {
  static async getAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const agents = await agentService.getAll();
      res.json(agents);
    } catch (err) { next(err); }
  }

  static async toggle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const agent = await agentService.toggle(req.params.id as string, req.body.enabled);
      res.json(agent);
    } catch (err) { next(err); }
  }

  static async manualRun(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await agentService.manualRun(req.params.id as string);
      res.json(result);
    } catch (err) { next(err); }
  }

  static async getAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const logs = await agentService.getAuditLogs(req.params.id as string);
      res.json(logs);
    } catch (err) { next(err); }
  }
}
