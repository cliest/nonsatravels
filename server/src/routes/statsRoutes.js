import express from 'express';
import { getStats } from '../controllers/statsController.js';
import { verifyAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', verifyAuth, requireAdmin, getStats);

export default router;
