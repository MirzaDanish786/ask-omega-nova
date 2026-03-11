import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from '../../common/guards/auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { ModuleGuard } from '../../common/guards/module.guard.js';

@Module({
  providers: [
    // Global auth guard — all routes require auth unless @Public()
    { provide: APP_GUARD, useClass: AuthGuard },
    // Global roles guard — checks @Roles() decorator
    { provide: APP_GUARD, useClass: RolesGuard },
    // Global module guard — checks @RequireModule() decorator
    { provide: APP_GUARD, useClass: ModuleGuard },
  ],
})
export class AuthModule {}
