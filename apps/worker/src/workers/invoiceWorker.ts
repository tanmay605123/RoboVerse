import { Worker, Job } from 'bullmq';
import Redis from 'ioredis';

export interface InvoiceJobData {
  invoiceId: string;
  orderId: string;
  userId: string;
  studentId: string;
  customerEmail: string;
  amountInr: number;
}

export function createInvoiceWorker(redisConnection: Redis) {
  const worker = new Worker<InvoiceJobData>(
    'invoice-queue',
    async (job: Job<InvoiceJobData>) => {
      console.log(`🧾 [InvoiceWorker] Processing GST Invoice for Order ${job.data.orderId}...`);
      // Simulate PDF compilation & upload to S3/Cloudinary
      await new Promise((resolve) => setTimeout(resolve, 500));
      const pdfUrl = `https://storage.roboverse.io/invoices/${job.data.invoiceId}.pdf`;
      console.log(`✅ [InvoiceWorker] Invoice PDF generated: ${pdfUrl}`);
      return { success: true, pdfUrl };
    },
    { connection: redisConnection }
  );

  worker.on('failed', (job: Job<InvoiceJobData> | undefined, err: Error) => {
    console.error(`❌ [InvoiceWorker] Job ${job?.id} failed:`, err);
  });

  return worker;
}
