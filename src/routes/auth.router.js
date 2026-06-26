import express from 'express';
import { registerCustomer, loginCustomer } from '../controllers/customerAuth.controller.js';
import { registerWorker, loginWorker } from '../controllers/workerAuth.controller.js';
import { refreshSession } from '../controllers/token.controller.js';

const router = express.Router();

router.post('/customer/register', registerCustomer);
router.post('/customer/login', loginCustomer);
router.post('/worker/register', registerWorker);
router.post('/worker/login', loginWorker);
router.post('/refresh', refreshSession);

export default router;