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
  getMyHotels,
} from '../controllers/hotelController.js';
import { verifyAuth, requireAdmin } from '../middleware/auth.js';

const requireAdminOrOwner = (req, res, next) => {
  if (req.user?.role === 'admin' || req.user?.role === 'hotel_owner') return next();
  return res.status(403).json({ success: false, message: 'Admin or hotel owner access required' });
};

const router = express.Router();

// Public routes
router.get('/', getHotels);
router.get('/featured', getFeaturedHotels);
router.get('/:id', getHotel);

// Owner routes
router.get('/owner/my-hotels', verifyAuth, requireAdminOrOwner, getMyHotels);

// Admin routes (protected)
router.post('/', verifyAuth, requireAdmin, createHotel);
router.put('/:id', verifyAuth, requireAdminOrOwner, updateHotel);
router.delete('/:id', verifyAuth, requireAdmin, deleteHotel);
router.patch('/:id/featured', verifyAuth, requireAdmin, toggleFeatured);

// Room type CRUD (admin or owner)
router.post('/:hotelId/room-types', verifyAuth, requireAdminOrOwner, addRoomType);
router.put('/:hotelId/room-types/:roomTypeId', verifyAuth, requireAdminOrOwner, updateRoomType);
router.delete('/:hotelId/room-types/:roomTypeId', verifyAuth, requireAdminOrOwner, deleteRoomType);

export default router;
