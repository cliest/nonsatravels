import prisma from '../lib/prisma.js';

const chatInclude = { messages: { orderBy: { timestamp: 'asc' } } };

export const getUserChat = async (req, res) => {
  try {
    const userId = req.user.id;
    const userName = req.user.fullName;
    const userEmail = req.user.email;

    let chat = await prisma.chat.findFirst({
      where: { userId, status: { not: 'closed' } },
      include: chatInclude,
    });

    if (!chat) {
      chat = await prisma.chat.create({
        data: { userId, userName, userEmail, status: 'pending' },
        include: chatInclude,
      });
    }

    res.status(200).json({ success: true, data: chat });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get chat session', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

export const getAllChats = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const where = status ? { status } : {};

    const [total, chats] = await Promise.all([
      prisma.chat.count({ where }),
      prisma.chat.findMany({
        where,
        include: chatInclude,
        orderBy: { lastMessageAt: 'desc' },
        take: parseInt(limit),
        skip: (parseInt(page) - 1) * parseInt(limit),
      }),
    ]);

    res.status(200).json({
      success: true,
      data: chats,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch chats', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

export const getChatById = async (req, res) => {
  try {
    const chat = await prisma.chat.findUnique({ where: { id: req.params.chatId }, include: chatInclude });
    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });

    if (req.user.role !== 'admin' && chat.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this chat' });
    }

    res.status(200).json({ success: true, data: chat });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch chat', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { sender, message } = req.body;

    if (!sender || !message) {
      return res.status(400).json({ success: false, message: 'Sender and message are required' });
    }
    if (!['user', 'admin'].includes(sender)) {
      return res.status(400).json({ success: false, message: 'Invalid sender' });
    }
    if (sender === 'admin' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to send as admin' });
    }

    const chat = await prisma.chat.findUnique({ where: { id: chatId } });
    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });

    if (req.user.role !== 'admin' && chat.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this chat' });
    }

    const senderName = req.user.fullName;
    const senderId = req.user.id;

    await prisma.chatMessage.create({
      data: { chatId, sender, senderName, senderId, message, timestamp: new Date(), read: false },
    });

    const updateData = { lastMessageAt: new Date() };
    if (sender === 'user') {
      updateData.unreadUserMessages = { increment: 1 };
      updateData.status = 'active';
    } else {
      updateData.unreadAdminMessages = { increment: 1 };
    }

    const updated = await prisma.chat.update({ where: { id: chatId }, data: updateData, include: chatInclude });
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to send message', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

export const markMessagesAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { reader } = req.body;

    const chat = await prisma.chat.findUnique({ where: { id: chatId } });
    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });

    if (req.user.role !== 'admin' && chat.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this chat' });
    }

    const senderToMark = reader === 'user' ? 'admin' : 'user';
    await prisma.chatMessage.updateMany({
      where: { chatId, sender: senderToMark, read: false },
      data: { read: true },
    });

    const resetField = reader === 'user' ? { unreadAdminMessages: 0 } : { unreadUserMessages: 0 };
    const updated = await prisma.chat.update({ where: { id: chatId }, data: resetField, include: chatInclude });
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to mark messages as read', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

export const updateChatStatus = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { status, assignedTo } = req.body;

    const data = {};
    if (status) data.status = status;
    if (assignedTo !== undefined) data.assignedTo = assignedTo;

    const chat = await prisma.chat.findUnique({ where: { id: chatId } });
    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });

    const updated = await prisma.chat.update({ where: { id: chatId }, data, include: chatInclude });
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update chat status', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

export const getChatStats = async (req, res) => {
  try {
    const [totalChats, activeChats, pendingChats, closedChats, unreadResult] = await Promise.all([
      prisma.chat.count(),
      prisma.chat.count({ where: { status: 'active' } }),
      prisma.chat.count({ where: { status: 'pending' } }),
      prisma.chat.count({ where: { status: 'closed' } }),
      prisma.chat.aggregate({
        _sum: { unreadUserMessages: true },
        where: { status: { not: 'closed' } },
      }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalChats, activeChats, pendingChats, closedChats,
        unreadMessages: unreadResult._sum.unreadUserMessages || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get chat statistics', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

export const rateChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { score, feedback } = req.body;

    if (!score || score < 1 || score > 5) {
      return res.status(400).json({ success: false, message: 'Rating score must be between 1 and 5' });
    }

    const chat = await prisma.chat.findUnique({ where: { id: chatId } });
    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });

    if (req.user.role !== 'admin' && chat.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this chat' });
    }

    const updated = await prisma.chat.update({
      where: { id: chatId },
      data: { ratingScore: score, ratingFeedback: feedback || '', ratingRatedAt: new Date() },
      include: chatInclude,
    });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to rate chat', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

export const sendChatTranscript = async (req, res) => {
  try {
    const { chatId } = req.params;
    const chat = await prisma.chat.findUnique({ where: { id: chatId }, include: chatInclude });
    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });

    if (req.user.role !== 'admin' && chat.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this chat' });
    }

    const { sendEmail } = await import('../utils/emailService.js');
    const { chatTranscriptEmail, EMAIL_SUBJECTS } = await import('../utils/emailTemplates.js');

    const emailTemplate = chatTranscriptEmail(chat);
    await sendEmail(chat.userEmail, EMAIL_SUBJECTS.CHAT_TRANSCRIPT, emailTemplate.html, emailTemplate.text);

    res.status(200).json({ success: true, message: 'Chat transcript sent successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to send chat transcript', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};
