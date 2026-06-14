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
import { verifyAuth, optionalAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// User routes - optionalAuth allows both signed-in users and guests (identified via guestId)
router.post('/session', optionalAuth, getUserChat);
router.get('/:chatId', optionalAuth, getChatById);
router.post('/:chatId/messages', optionalAuth, sendMessage);
router.patch('/:chatId/read', optionalAuth, markMessagesAsRead);
router.post('/:chatId/rate', optionalAuth, rateChat);
router.post('/:chatId/transcript', optionalAuth, sendChatTranscript);

// Admin routes
router.get('/', verifyAuth, requireAdmin, getAllChats);
router.patch('/:chatId/status', verifyAuth, requireAdmin, updateChatStatus);
router.get('/admin/stats', verifyAuth, requireAdmin, getChatStats);

export default router;
