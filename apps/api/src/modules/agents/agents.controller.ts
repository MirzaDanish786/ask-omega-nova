import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { AgentsService } from './agents.service.js';
import { Roles } from '../../common/decorators/roles.decorator.js';

@Controller('agents')
@Roles('ADMIN')
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Get()
  getAll() {
    return this.agentsService.getAll();
  }

  @Post(':id/toggle')
  toggle(@Param('id') id: string, @Body() body: { enabled: boolean }) {
    return this.agentsService.toggle(id, body.enabled);
  }

  @Post(':id/run')
  manualRun(@Param('id') id: string) {
    return this.agentsService.manualRun(id);
  }

  @Get(':id/audit')
  getAuditLogs(@Param('id') id: string) {
    return this.agentsService.getAuditLogs(id);
  }
}
