import express from 'express';
import {
  sendContactEmail,
  subscribeNewsletter,
  getSubscribers,
  deleteSubscriber,
  unsubscribeNewsletter,
  sendNewsletter,
} from '../controllers/contactController.js';
import { validate, contactSchema } from '../middleware/validation.js';
import { contactLimiter } from '../middleware/rateLimiter.js';
import { verifyAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/send', contactLimiter, validate(contactSchema.send), sendContactEmail);
router.post('/newsletter', contactLimiter, validate(contactSchema.newsletter), subscribeNewsletter);
router.post('/newsletter/unsubscribe', contactLimiter, validate(contactSchema.newsletter), unsubscribeNewsletter);

// Admin routes
router.get('/newsletter/subscribers', verifyAuth, requireAdmin, getSubscribers);
router.delete('/newsletter/subscribers/:id', verifyAuth, requireAdmin, deleteSubscriber);
router.post('/newsletter/send', verifyAuth, requireAdmin, sendNewsletter);

export default router;
