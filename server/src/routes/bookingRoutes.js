import express from 'express';
import {
  getBookings,
  getBooking,
  createBooking,
  updateBookingStatus,
  cancelBooking,
  deleteBookingPermanently,
  getBookingStats,
  modifyBooking,
  generateInvoice,
  sendInvoiceEmail,
} from '../controllers/bookingController.js';
import { verifyAuth, requireAdmin, optionalAuth } from '../middleware/auth.js';
import { validate, bookingSchema } from '../middleware/validation.js';
import { bookingLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Routes with validation
router.get('/', optionalAuth, getBookings);
router.get('/stats', optionalAuth, getBookingStats);
router.get('/:id', verifyAuth, getBooking);
router.get('/:id/invoice', verifyAuth, generateInvoice);
router.post('/', bookingLimiter, optionalAuth, validate(bookingSchema.create), createBooking);
router.post('/:id/send-invoice', verifyAuth, requireAdmin, sendInvoiceEmail);
router.put('/:id/modify', verifyAuth, modifyBooking);
router.patch('/:id/status', verifyAuth, requireAdmin, validate(bookingSchema.updateStatus), updateBookingStatus);
router.delete('/:id', verifyAuth, cancelBooking);
router.delete('/:id/permanent', verifyAuth, requireAdmin, deleteBookingPermanently);

export default router;
