import { Router } from 'express';
import { getLeadsHandler } from './leads.controller';

const router = Router();

router.get('/', getLeadsHandler);

export default router;
