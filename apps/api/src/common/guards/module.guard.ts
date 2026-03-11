import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { MODULE_KEY } from '../decorators/require-module.decorator.js';
import { UserRole, can, type ModuleName } from '@omega-nova/shared';

@Injectable()
export class ModuleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredModule = this.reflector.getAllAndOverride<string>(MODULE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredModule) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    const hasAccess = can(
      {
        role: user.role as UserRole,
        email: user.email,
        assignedModules: user.assignedModules,
      },
      `${requiredModule}:view`,
      requiredModule as ModuleName,
    );

    if (!hasAccess) {
      throw new ForbiddenException(`No access to module: ${requiredModule}`);
    }

    return true;
  }
}
