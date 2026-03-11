import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { CurrentUser, type RequestUser } from '../../common/decorators/current-user.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import type { UserRole } from '../../entities/index.js';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getMe(@CurrentUser() user: RequestUser) {
    return this.usersService.getById(user.id);
  }

  @Patch('me')
  updateMe(
    @CurrentUser() user: RequestUser,
    @Body() body: { name?: string; onboardingCompleted?: boolean; accessLevel?: string; apiMode?: string; alertsEnabled?: boolean },
  ) {
    return this.usersService.updateProfile(user.id, body);
  }

  @Get()
  @Roles('ADMIN')
  getAll() {
    return this.usersService.getAll();
  }

  /**
   * Admin-only: create a new user.
   * Users cannot self-register — only admins can create accounts.
   */
  @Post()
  @Roles('ADMIN')
  createUser(
    @Body() body: { email: string; password: string; name: string; role?: UserRole },
  ) {
    return this.usersService.createUser(body);
  }

  @Patch(':id/role')
  @Roles('ADMIN')
  updateRole(
    @Param('id') id: string,
    @Body() body: { role: UserRole },
  ) {
    return this.usersService.updateRole(id, body.role);
  }

  @Patch(':id/modules')
  @Roles('ADMIN')
  updateModules(
    @Param('id') id: string,
    @Body() body: { modules: string[] },
  ) {
    return this.usersService.updateModules(id, body.modules);
  }
}
