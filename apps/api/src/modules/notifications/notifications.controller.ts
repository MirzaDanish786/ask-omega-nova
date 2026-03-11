import { Controller, Get, Patch, Param } from '@nestjs/common';
import { NotificationsService } from './notifications.service.js';
import { CurrentUser, type RequestUser } from '../../common/decorators/current-user.decorator.js';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  getAll(@CurrentUser() user: RequestUser) {
    return this.notificationsService.getByUserId(user.id);
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }
}
