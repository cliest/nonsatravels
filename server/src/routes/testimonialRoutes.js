import express from 'express';
import {
  getAllTestimonials,
  getAllTestimonialsAdmin,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  toggleTestimonialStatus,
} from '../controllers/testimonialController.js';
import { verifyAuth, requireAdmin, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getAllTestimonials);

// Admin routes (protected)
router.get('/admin', optionalAuth, getAllTestimonialsAdmin); // Allow fetching without strict auth
router.post('/', verifyAuth, requireAdmin, createTestimonial);
router.put('/:id', verifyAuth, requireAdmin, updateTestimonial);
router.delete('/:id', verifyAuth, requireAdmin, deleteTestimonial);
router.patch('/:id/toggle', verifyAuth, requireAdmin, toggleTestimonialStatus);

export default router;
