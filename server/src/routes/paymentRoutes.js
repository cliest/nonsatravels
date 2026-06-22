import express from 'express';
import { initiateMoMo, initiateCard, checkStatus, handleWebhook, getExchangeRate } from '../controllers/paymentController.js';
import { verifyAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/exchange-rate', getExchangeRate);
router.post('/initiate-mobile', verifyAuth, initiateMoMo);
router.post('/initiate-card', verifyAuth, initiateCard);
router.get('/status/:referenceId', verifyAuth, checkStatus);
router.post('/webhook', handleWebhook);

export default router;
