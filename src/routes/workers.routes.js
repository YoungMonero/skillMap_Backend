import express from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { getNearbyWorkers, updateAvailability, updateLocation, getWorkerProfile } from '../controllers/workers.controller.js';

const router = express.Router();

router.get('/nearby', getNearbyWorkers); // public — customers browse before logging in
router.patch('/availability', requireAuth, updateAvailability);
router.patch('/location', requireAuth, updateLocation);
router.get('/:id', getWorkerProfile);

export default router;