import express from 'express';
import { sendContactEmail, subscribeNewsletter } from '../controllers/contactController.js';
import { validate, contactSchema } from '../middleware/validation.js';
import { contactLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Public routes with validation and rate limiting
router.post('/send', contactLimiter, validate(contactSchema.send), sendContactEmail);
router.post('/newsletter', contactLimiter, validate(contactSchema.newsletter), subscribeNewsletter);

export default router;
