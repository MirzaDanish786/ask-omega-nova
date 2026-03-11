import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { SimulationsService } from './simulations.service.js';
import { CurrentUser, type RequestUser } from '../../common/decorators/current-user.decorator.js';
import { RequireModule } from '../../common/decorators/require-module.decorator.js';

@Controller('simulations')
export class SimulationsController {
  constructor(private readonly simulationsService: SimulationsService) {}

  @Get()
  @RequireModule('simulations')
  getAll(@CurrentUser() user: RequestUser) {
    return this.simulationsService.getByUserId(user.id);
  }

  @Post()
  @RequireModule('simulations')
  create(
    @CurrentUser() user: RequestUser,
    @Body() body: { query: string },
  ) {
    return this.simulationsService.create(user.id, body.query);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.simulationsService.getById(id);
  }

  @Post(':id/continue')
  continueThread(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() body: { message: string },
  ) {
    return this.simulationsService.continueThread(id, user.id, body.message);
  }
}
