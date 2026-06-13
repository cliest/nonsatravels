import express from 'express';
import { 
  getReferralCode, 
  validateReferralCode, 
  getReferralStats 
} from '../controllers/referralController.js';
import { verifyAuth } from '../middleware/auth.js';

const router = express.Router();

// Protected routes (require authentication)
router.get('/my-code', verifyAuth, getReferralCode);
router.get('/stats', verifyAuth, getReferralStats);

// Public route (no auth needed for validation)
router.get('/validate/:code', validateReferralCode);

export default router;
