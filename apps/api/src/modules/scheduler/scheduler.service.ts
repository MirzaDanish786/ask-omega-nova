import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OgwiService } from '../ogwi/ogwi.service.js';
import { UsersService } from '../users/users.service.js';

@Injectable()
export class SchedulerService implements OnModuleInit {
  constructor(
    private readonly ogwiService: OgwiService,
    private readonly usersService: UsersService,
  ) {}

  onModuleInit() {
    console.log('[Scheduler] Cron jobs registered (OGWI bi-daily, monthly sim reset)');
  }

  // Bi-daily OGWI update: 06:30 and 18:30 UTC
  @Cron('30 6,18 * * *', { timeZone: 'UTC' })
  async handleOgwiUpdate() {
    console.log('[Scheduler] Running bi-daily OGWI update...');
    try {
      const result = await this.ogwiService.triggerUpdate();
      console.log(`[Scheduler] OGWI updated: ${result.ogwiScore} (${result.crisisLevel})`);
    } catch (err) {
      console.error('[Scheduler] OGWI update failed:', err);
    }
  }

  // Monthly simulation count reset: 1st of each month at 00:00 UTC
  @Cron('0 0 1 * *', { timeZone: 'UTC' })
  async handleMonthlySimReset() {
    console.log('[Scheduler] Resetting monthly simulation counts...');
    try {
      await this.usersService.resetAllSimCounts();
      console.log('[Scheduler] Simulation counts reset');
    } catch (err) {
      console.error('[Scheduler] Sim count reset failed:', err);
    }
  }
}
