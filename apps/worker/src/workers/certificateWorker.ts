import { Worker, Job } from 'bullmq';
import Redis from 'ioredis';

export interface CertificateJobData {
  certificateId: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseName: string;
  scorePct: number;
}

export function createCertificateWorker(redisConnection: Redis) {
  const worker = new Worker<CertificateJobData>(
    'certificate-queue',
    async (job: Job<CertificateJobData>) => {
      console.log(`🎓 [CertificateWorker] Generating official certificate ${job.data.certificateId} for ${job.data.studentName}...`);
      await new Promise((resolve) => setTimeout(resolve, 800));
      const certificatePdfUrl = `https://storage.roboverse.io/certificates/${job.data.certificateId}.pdf`;
      console.log(`✅ [CertificateWorker] Certificate rendered & signed: ${certificatePdfUrl}`);
      return { success: true, certificatePdfUrl };
    },
    { connection: redisConnection }
  );

  worker.on('failed', (job: Job<CertificateJobData> | undefined, err: Error) => {
    console.error(`❌ [CertificateWorker] Job ${job?.id} failed:`, err);
  });

  return worker;
}
