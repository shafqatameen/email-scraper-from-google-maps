import { Request, Response } from 'express';
import { startScrapeJob, checkJobStatus, checkAllJobs } from './jobs.service';
import { createJobSchema } from './jobs.schema';
import { z } from 'zod';

export const createJobHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { query, limit } = createJobSchema.parse(req.body);
    const job = await startScrapeJob(query, limit);
    res.status(201).json({ success: true, data: job });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, errors: (error as any).errors });
      return;
    }
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

export const getJobStatusHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const job = await checkJobStatus(id as string);
    
    if (!job) {
      res.status(404).json({ success: false, error: 'Job not found' });
      return;
    }
    
    res.status(200).json({ success: true, data: job });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

export const getAllJobsHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const jobs = await checkAllJobs();
    res.status(200).json({ success: true, data: jobs });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};
