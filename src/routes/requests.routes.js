import express from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { createRequest, getWorkerRequests, respondToRequest } from '../controllers/requests.controller.js';

const router = express.Router();

router.post('/', requireAuth, createRequest);
router.get('/worker', requireAuth, getWorkerRequests);
router.patch('/:id/respond', requireAuth, respondToRequest);

export default router;