import { Controller, Get, Query } from '@nestjs/common';
import { EarlyWarningService } from './early-warning.service.js';
import { RequireModule } from '../../common/decorators/require-module.decorator.js';

@Controller('early-warning')
@RequireModule('early-warning')
export class EarlyWarningController {
  constructor(private readonly earlyWarningService: EarlyWarningService) {}

  @Get('current')
  getCurrent() {
    return this.earlyWarningService.getLatestByRegion();
  }

  @Get('history')
  getHistory(
    @Query('region') region?: string,
    @Query('limit') limit?: string,
  ) {
    return this.earlyWarningService.getHistory(region, limit ? Number(limit) : undefined);
  }
}
