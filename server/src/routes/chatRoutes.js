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
router.post('/session', getUserChat);
router.get('/:chatId', getChatById);
router.post('/:chatId/messages', sendMessage);
router.patch('/:chatId/read', markMessagesAsRead);
router.post('/:chatId/rate', rateChat);
router.post('/:chatId/transcript', sendChatTranscript);

// Admin routes
router.get('/', verifyAuth, requireAdmin, getAllChats);
router.patch('/:chatId/status', verifyAuth, requireAdmin, updateChatStatus);
router.get('/admin/stats', verifyAuth, requireAdmin, getChatStats);

export default router;
