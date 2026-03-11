import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator.js';
import { auth } from '../../config/auth.js';
import { fromNodeHeaders } from 'better-auth/node';

function parseModules(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    try { return JSON.parse(raw); } catch { return []; }
  }
  return [];
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route is public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();

    try {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(request.headers),
      });

      if (!session?.user) {
        throw new UnauthorizedException('Authentication required');
      }

      const userData = session.user as Record<string, unknown>;

      // Attach user to request
      request.user = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: userData.role as string ?? 'VIEWER',
        assignedModules: parseModules(userData.assignedModules),
        accountStatus: userData.accountStatus as string ?? 'PENDING',
        emailVerified: !!session.user.emailVerified,
      };

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('Invalid session');
    }
  }
}
