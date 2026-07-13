import { z } from 'zod';

export const getLeadsSchema = z.object({
  jobId: z.string().uuid('Invalid Job ID').optional(),
  limit: z.coerce.number().int().positive().default(50),
  page: z.coerce.number().int().positive().default(1)
});
