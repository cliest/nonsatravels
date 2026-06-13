import express from 'express';
import { 
  getMyLoyalty, 
  getPointsHistory, 
  redeemPoints 
} from '../controllers/loyaltyController.js';
import { verifyAuth } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(verifyAuth);

router.get('/my-points', getMyLoyalty);
router.get('/history', getPointsHistory);
router.post('/redeem', redeemPoints);

export default router;
