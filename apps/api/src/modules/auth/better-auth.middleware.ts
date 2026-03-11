import { Injectable, NestMiddleware } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import { toNodeHandler } from 'better-auth/node';
import { auth } from '../../config/auth.js';

const betterAuthHandler = toNodeHandler(auth);

@Injectable()
export class BetterAuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, _next: NextFunction): void {
    // BetterAuth handles its own body parsing and routing.
    // It consumes the request fully — no need to call next().
    betterAuthHandler(req, res);
  }
}
