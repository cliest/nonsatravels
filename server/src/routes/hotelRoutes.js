import express from 'express';
import {
  getHotels,
  getHotel,
  createHotel,
  updateHotel,
  deleteHotel,
  getFeaturedHotels,
  toggleFeatured,
} from '../controllers/hotelController.js';
import { verifyAuth, requireAdmin } from '../middleware/auth.js';
import { validate, hotelSchema } from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.get('/', getHotels);
router.get('/featured', getFeaturedHotels);
router.get('/:id', getHotel);

// Admin routes (protected)
router.post('/', verifyAuth, requireAdmin, validate(hotelSchema.create), createHotel);
router.put('/:id', verifyAuth, requireAdmin, validate(hotelSchema.update), updateHotel);
router.delete('/:id', verifyAuth, requireAdmin, deleteHotel);
router.patch('/:id/featured', verifyAuth, requireAdmin, toggleFeatured);

export default router;
