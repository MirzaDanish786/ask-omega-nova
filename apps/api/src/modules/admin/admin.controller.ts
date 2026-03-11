import { Controller, Get } from '@nestjs/common';
import { AdminService } from './admin.service.js';
import { Roles } from '../../common/decorators/roles.decorator.js';

@Controller('admin')
@Roles('ADMIN')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }

  @Get('audit-logs')
  getAuditLogs() {
    return this.adminService.getAuditLogs();
  }
}
