import express from 'express';
import {
  getUserChat,
  getAllChats,
  getChatById,
  sendMessage,
  markMessagesAsRead,
  updateChatStatus,
  getChatStats,
  rateChat,
  sendChatTranscript,
} from '../controllers/chatController.js';
import { verifyAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// User routes
router.post('/session', verifyAuth, getUserChat);
router.get('/:chatId', verifyAuth, getChatById);
router.post('/:chatId/messages', verifyAuth, sendMessage);
router.patch('/:chatId/read', verifyAuth, markMessagesAsRead);
router.post('/:chatId/rate', verifyAuth, rateChat);
router.post('/:chatId/transcript', verifyAuth, sendChatTranscript);

// Admin routes
router.get('/', verifyAuth, requireAdmin, getAllChats);
router.patch('/:chatId/status', verifyAuth, requireAdmin, updateChatStatus);
router.get('/admin/stats', verifyAuth, requireAdmin, getChatStats);

export default router;
