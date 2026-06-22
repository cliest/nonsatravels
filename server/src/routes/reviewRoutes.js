import express from 'express';
import {
  getHotelReviews,
  getAllReviews,
  createReview,
  updateReview,
  deleteReview,
  markReviewHelpful,
  approveReview,
  rejectReview,
} from '../controllers/reviewController.js';
import { verifyAuth, optionalAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/hotel/:hotelId', optionalAuth, getHotelReviews);
router.get('/admin/all', verifyAuth, requireAdmin, getAllReviews);
router.post('/', verifyAuth, createReview);
router.put('/:id', verifyAuth, updateReview);
router.delete('/:id', verifyAuth, deleteReview);
router.patch('/:id/helpful', optionalAuth, markReviewHelpful);
router.patch('/:id/approve', verifyAuth, requireAdmin, approveReview);
router.delete('/:id/reject', verifyAuth, requireAdmin, rejectReview);

export default router;
