import express from 'express';
import { getStats } from '../controllers/statsController.js';

const router = express.Router();

// Public route - get platform statistics
router.get('/', getStats);

export default router;
