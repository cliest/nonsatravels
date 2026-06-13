import express from 'express';
import {
  getAllCannedResponses,
  createCannedResponse,
  updateCannedResponse,
  deleteCannedResponse,
  incrementUsageCount,
} from '../controllers/cannedResponseController.js';
import { verifyAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', verifyAuth, getAllCannedResponses);
router.post('/', verifyAuth, requireAdmin, createCannedResponse);
router.put('/:id', verifyAuth, requireAdmin, updateCannedResponse);
router.delete('/:id', verifyAuth, requireAdmin, deleteCannedResponse);
router.post('/:id/use', verifyAuth, requireAdmin, incrementUsageCount);

export default router;
