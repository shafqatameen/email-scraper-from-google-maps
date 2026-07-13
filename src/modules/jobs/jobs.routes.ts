import { Router } from 'express';
import { createJobHandler, getJobStatusHandler, getAllJobsHandler } from './jobs.controller';

const router = Router();

router.post('/', createJobHandler);
router.get('/', getAllJobsHandler);
router.get('/:id', getJobStatusHandler);

export default router;
