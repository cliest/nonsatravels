import express from 'express';
import {
  getHotels,
  getHotel,
  createHotel,
  updateHotel,
  deleteHotel,
  getFeaturedHotels,
  toggleFeatured,
  addRoomType,
  updateRoomType,
  deleteRoomType,
} from '../controllers/hotelController.js';
import { verifyAuth, requireAdmin } from '../middleware/auth.js';
import { validate, hotelSchema } from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.get('/', getHotels);
router.get('/featured', getFeaturedHotels);
router.get('/:id', getHotel);

// Admin routes (protected)
router.post('/', verifyAuth, requireAdmin, createHotel);
router.put('/:id', verifyAuth, requireAdmin, updateHotel);
router.delete('/:id', verifyAuth, requireAdmin, deleteHotel);
router.patch('/:id/featured', verifyAuth, requireAdmin, toggleFeatured);

// Room type CRUD (admin)
router.post('/:hotelId/room-types', verifyAuth, requireAdmin, addRoomType);
router.put('/:hotelId/room-types/:roomTypeId', verifyAuth, requireAdmin, updateRoomType);
router.delete('/:hotelId/room-types/:roomTypeId', verifyAuth, requireAdmin, deleteRoomType);

export default router;
