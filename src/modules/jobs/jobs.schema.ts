import { z } from 'zod';

export const createJobSchema = z.object({
  query: z.string().min(1, 'Query is required'),
  limit: z.number().int().positive().default(20)
});
