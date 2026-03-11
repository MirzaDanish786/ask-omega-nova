import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedulerService } from './scheduler.service.js';
import { OgwiModule } from '../ogwi/ogwi.module.js';
import { UsersModule } from '../users/users.module.js';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    OgwiModule,
    UsersModule,
  ],
  providers: [SchedulerService],
})
export class SchedulerModule {}
