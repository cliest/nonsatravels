import express from 'express';
import { initiateMoMo, initiateCard, checkStatus, handleWebhook } from '../controllers/paymentController.js';
import { verifyAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/initiate-mobile', verifyAuth, initiateMoMo);
router.post('/initiate-card', verifyAuth, initiateCard);
router.get('/status/:referenceId', verifyAuth, checkStatus);
router.post('/webhook', handleWebhook);

export default router;
