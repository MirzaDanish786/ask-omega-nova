import { Module } from '@nestjs/common';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { AuthGuard } from '../../common/guards/auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { ModuleGuard } from '../../common/guards/module.guard.js';

@Module({
  providers: [
    // Global auth guard — all routes require auth unless @Public()
    {
      provide: APP_GUARD,
      useFactory: (reflector: Reflector) => new AuthGuard(reflector),
      inject: [Reflector],
    },
    // Global roles guard — checks @Roles() decorator
    {
      provide: APP_GUARD,
      useFactory: (reflector: Reflector) => new RolesGuard(reflector),
      inject: [Reflector],
    },
    // Global module guard — checks @RequireModule() decorator
    {
      provide: APP_GUARD,
      useFactory: (reflector: Reflector) => new ModuleGuard(reflector),
      inject: [Reflector],
    },
  ],
})
export class AuthModule {}
