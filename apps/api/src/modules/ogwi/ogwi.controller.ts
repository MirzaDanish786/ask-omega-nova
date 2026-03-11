import { Controller, Get, Post, Query } from '@nestjs/common';
import { OgwiService } from './ogwi.service.js';
import { RequireModule } from '../../common/decorators/require-module.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';

@Controller('ogwi')
@RequireModule('ogwi')
export class OgwiController {
  constructor(private readonly ogwiService: OgwiService) {}

  @Get('current')
  getCurrent() {
    return this.ogwiService.getCurrent();
  }

  @Get('historical')
  getHistorical(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('limit') limit?: string,
  ) {
    return this.ogwiService.getHistorical(from, to, limit ? Number(limit) : undefined);
  }

  @Get('forecast')
  getForecast() {
    return this.ogwiService.getForecast();
  }

  @Post('update')
  @Roles('ADMIN')
  triggerUpdate() {
    return this.ogwiService.triggerUpdate();
  }
}
