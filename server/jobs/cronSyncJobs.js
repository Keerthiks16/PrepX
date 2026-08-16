import cron from 'node-cron';
import { syncAll } from '../services/jobIngestionService.js';

let isRunning = false;

export const startJobSyncCron = () => {
  if (process.env.JOB_SYNC_ENABLED !== 'true') {
    console.log('[cron] Job sync disabled (JOB_SYNC_ENABLED != true)');
    return;
  }

  const schedule = process.env.JOB_SYNC_CRON || '0 */6 * * *';

  if (!cron.validate(schedule)) {
    console.error(`[cron] Invalid JOB_SYNC_CRON expression: ${schedule}`);
    return;
  }

  cron.schedule(schedule, async () => {
    if (isRunning) {
      console.log('[cron] Skipping job sync — previous run still in progress');
      return;
    }

    isRunning = true;
    console.log('[cron] Starting scheduled job sync...');

    try {
      const stats = await syncAll();
      console.log('[cron] Job sync complete:', stats);
    } catch (err) {
      console.error('[cron] Job sync failed:', err.message);
    } finally {
      isRunning = false;
    }
  });

  console.log(`[cron] Job sync scheduled: ${schedule}`);
};
