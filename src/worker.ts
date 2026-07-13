import { Worker } from 'bullmq';
import { scrapeGoogleMaps } from '../lib/mapsScraper';
import { extractEmails } from '../lib/emailExtractor';
import { updateJobStatus } from './modules/jobs/jobs.repository';
import { saveLead } from './modules/leads/leads.service';

const connection = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379'),
};

const worker = new Worker(
  'scrape-jobs',
  async (job) => {
    const { jobId, query, limit } = job.data;
    
    await updateJobStatus(jobId, 'processing');
    console.log(`Job ${jobId} started for query: ${query}`);

    try {
      let count = 0;
      for await (const business of scrapeGoogleMaps(query, limit)) {
        if (business.website) {
          console.log(`Extracting emails for ${business.name}...`);
          business.emails = await extractEmails(business.website);
        }
        
        await saveLead(jobId, business.name, business.emails || [], business.website);
        count++;
      }
      
      await updateJobStatus(jobId, 'completed');
      console.log(`Job ${jobId} completed. Found ${count} leads.`);
    } catch (error) {
      await updateJobStatus(jobId, 'failed');
      console.error(`Job ${jobId} failed:`, error);
      throw error;
    }
  },
  { connection }
);

worker.on('failed', (job, err) => {
  if (job) {
    console.error(`Job ${job.id} failed with error ${err.message}`);
  }
});

console.log('BullMQ Worker listening for scrape jobs...');
