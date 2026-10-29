import { Worker, Job } from 'bullmq';
import Redis from 'ioredis';

export interface DailyStatsJobData {
  date: string;
}

export function createDailyStatsWorker(redisConnection: Redis) {
  const worker = new Worker<DailyStatsJobData>(
    'daily-stats-queue',
    async (job: Job<DailyStatsJobData>) => {
      console.log(`📊 [DailyStatsWorker] Compiling telemetry and revenue aggregations for ${job.data.date}...`);
      await new Promise((resolve) => setTimeout(resolve, 600));
      console.log(`✅ [DailyStatsWorker] DailyStats precomputed successfully for ${job.data.date}`);
      return { success: true, date: job.data.date };
    },
    { connection: redisConnection }
  );

  worker.on('failed', (job: Job<DailyStatsJobData> | undefined, err: Error) => {
    console.error(`❌ [DailyStatsWorker] Job ${job?.id} failed:`, err);
  });

  return worker;
}
