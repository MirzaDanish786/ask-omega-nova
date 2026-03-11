import type { Request, Response, NextFunction } from 'express';
import { UserRole, can, type ModuleName } from '@omega-nova/shared';

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Forbidden', message: `Requires role: ${roles.join(' or ')}` });
      return;
    }
    next();
  };
}

export function requireModule(module: ModuleName) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const hasAccess = can(
      { role: req.user.role as UserRole, email: req.user.email, assignedModules: req.user.assignedModules },
      `${module}:view`,
      module,
    );
    if (!hasAccess) {
      res.status(403).json({ error: 'Forbidden', message: `No access to module: ${module}` });
      return;
    }
    next();
  };
}
