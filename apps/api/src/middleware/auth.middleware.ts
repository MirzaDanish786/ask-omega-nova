import type { Request, Response, NextFunction } from 'express';
import { auth } from '../config/auth.js';
import { fromNodeHeaders } from 'better-auth/node';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
        role: string;
        assignedModules: string[];
      };
    }
  }
}

function parseModules(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    try { return JSON.parse(raw); } catch { return []; }
  }
  return [];
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session?.user) {
      res.status(401).json({ error: 'Unauthorized', message: 'Authentication required' });
      return;
    }

    req.user = {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: (session.user as Record<string, unknown>).role as string ?? 'VIEWER',
      assignedModules: parseModules((session.user as Record<string, unknown>).assignedModules),
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Unauthorized', message: 'Invalid session' });
  }
}
