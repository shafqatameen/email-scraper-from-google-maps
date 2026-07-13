import { Queue } from 'bullmq';
import { createJob, getJobById, getAllJobs } from './jobs.repository';

// Initialize BullMQ Queue
const scrapeQueue = new Queue('scrape-jobs', {
  connection: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  }
});

export const startScrapeJob = async (query: string, limit: number) => {
  // 1. Save to DB
  const jobRecord = await createJob(query);
  
  // 2. Add to BullMQ
  await scrapeQueue.add('scrape-google-maps', {
    jobId: jobRecord.id,
    query,
    limit
  });
  
  return jobRecord;
};

export const checkJobStatus = async (id: string) => {
  return getJobById(id);
};

export const checkAllJobs = async () => {
  return getAllJobs();
};
