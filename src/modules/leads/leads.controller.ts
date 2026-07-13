import { Request, Response } from 'express';
import { fetchLeads } from './leads.service';
import { getLeadsSchema } from './leads.schema';
import { z } from 'zod';

export const getLeadsHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { jobId, limit, page } = getLeadsSchema.parse(req.query);
    const leads = await fetchLeads(jobId, limit, page);
    res.status(200).json({ success: true, data: leads });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, errors: (error as any).errors });
      return;
    }
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};
