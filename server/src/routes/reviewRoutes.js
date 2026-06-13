import express from 'express';
import {
  getHotelReviews,
  createReview,
  updateReview,
  deleteReview,
  markReviewHelpful,
} from '../controllers/reviewController.js';
import { verifyAuth, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Routes
router.get('/hotel/:hotelId', optionalAuth, getHotelReviews);
router.post('/', verifyAuth, createReview);
router.put('/:id', verifyAuth, updateReview);
router.delete('/:id', verifyAuth, deleteReview);
router.patch('/:id/helpful', optionalAuth, markReviewHelpful);

export default router;
