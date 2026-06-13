import express from 'express';
import {
  getOffers,
  getOfferById,
  createOffer,
  updateOffer,
  deleteOffer,
} from '../controllers/offerController.js';
import { verifyAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Routes
router.get('/', getOffers);
router.get('/:id', getOfferById);
router.post('/', verifyAuth, requireAdmin, createOffer);
router.put('/:id', verifyAuth, requireAdmin, updateOffer);
router.delete('/:id', verifyAuth, requireAdmin, deleteOffer);

export default router;
