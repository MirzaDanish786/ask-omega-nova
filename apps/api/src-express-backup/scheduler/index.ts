import cron from 'node-cron';
import { OgwiService } from '../services/ogwi.service.js';
import { UserRepository } from '../repositories/user.repository.js';

const ogwiService = new OgwiService();
const userRepo = new UserRepository();

export function startScheduler(): void {
  // Bi-daily OGWI update: 06:30 and 18:30 UTC
  cron.schedule('30 6,18 * * *', async () => {
    console.log('[Scheduler] Running bi-daily OGWI update...');
    try {
      const result = await ogwiService.triggerUpdate();
      console.log(`[Scheduler] OGWI updated: ${result.ogwiScore} (${result.crisisLevel})`);
    } catch (err) {
      console.error('[Scheduler] OGWI update failed:', err);
    }
  }, { timezone: 'UTC' });

  // Monthly simulation count reset: 1st of each month at 00:00 UTC
  cron.schedule('0 0 1 * *', async () => {
    console.log('[Scheduler] Resetting monthly simulation counts...');
    try {
      await userRepo.resetAllSimCounts();
      console.log('[Scheduler] Simulation counts reset');
    } catch (err) {
      console.error('[Scheduler] Sim count reset failed:', err);
    }
  }, { timezone: 'UTC' });

  console.log('[Scheduler] Cron jobs registered (OGWI bi-daily, monthly sim reset)');
}
