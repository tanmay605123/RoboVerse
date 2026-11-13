import Redis from 'ioredis';
import dotenv from 'dotenv';
import path from 'path';
import { createInvoiceWorker } from './workers/invoiceWorker';
import { createCertificateWorker } from './workers/certificateWorker';
import { createDailyStatsWorker } from './workers/dailyStatsWorker';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

console.log(`
╔═══════════════════════════════════════════════════════════════╗
║               ⚙️  ROBOVERSE BULLMQ WORKER SERVICE             ║
║      Invoices, Certificates, DailyStats & Background Jobs     ║
╚═══════════════════════════════════════════════════════════════╝
`);

const redisConnection = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null,
  lazyConnect: true,
});

redisConnection
  .connect()
  .then(() => {
    console.log(`⚡ Connected to Redis for BullMQ at ${REDIS_URL}`);
  })
  .catch((err) => {
    console.warn(`⚠️ Redis worker connection note: ${err.message}. Worker running in offline standby mode.`);
  });

const invoiceWorker = createInvoiceWorker(redisConnection);
const certificateWorker = createCertificateWorker(redisConnection);
const dailyStatsWorker = createDailyStatsWorker(redisConnection);

console.log('🚀 All RoboVerse BullMQ workers initialized and listening for jobs.');

const shutdown = async () => {
  console.log('Stopping RoboVerse Worker service gracefully...');
  await invoiceWorker.close();
  await certificateWorker.close();
  await dailyStatsWorker.close();
  await redisConnection.quit();
  console.log('RoboVerse Worker stopped.');
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
