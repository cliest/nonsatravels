import prisma from '../lib/prisma.js';

const chatInclude = { messages: { orderBy: { timestamp: 'asc' } } };

export const getUserChat = async (req, res) => {
  try {
    const { userId, userName, userEmail } = req.body;
    if (!userId || !userName || !userEmail) {
      return res.status(400).json({ success: false, message: 'User ID, name, and email are required' });
    }

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
    res.status(500).json({ success: false, message: 'Failed to get chat session', error: error.message });
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
    res.status(500).json({ success: false, message: 'Failed to fetch chats', error: error.message });
  }
};

export const getChatById = async (req, res) => {
  try {
    const chat = await prisma.chat.findUnique({ where: { id: req.params.chatId }, include: chatInclude });
    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });
    res.status(200).json({ success: true, data: chat });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch chat', error: error.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { sender, senderName, senderId, message } = req.body;

    if (!sender || !senderName || !senderId || !message) {
      return res.status(400).json({ success: false, message: 'All message fields are required' });
    }

    const chat = await prisma.chat.findUnique({ where: { id: chatId } });
    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });

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
    res.status(500).json({ success: false, message: 'Failed to send message', error: error.message });
  }
};

export const markMessagesAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { reader } = req.body;

    const chat = await prisma.chat.findUnique({ where: { id: chatId } });
    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });

    const senderToMark = reader === 'user' ? 'admin' : 'user';
    await prisma.chatMessage.updateMany({
      where: { chatId, sender: senderToMark, read: false },
      data: { read: true },
    });

    const resetField = reader === 'user' ? { unreadAdminMessages: 0 } : { unreadUserMessages: 0 };
    const updated = await prisma.chat.update({ where: { id: chatId }, data: resetField, include: chatInclude });
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to mark messages as read', error: error.message });
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
    res.status(500).json({ success: false, message: 'Failed to update chat status', error: error.message });
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
    res.status(500).json({ success: false, message: 'Failed to get chat statistics', error: error.message });
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

    const updated = await prisma.chat.update({
      where: { id: chatId },
      data: { ratingScore: score, ratingFeedback: feedback || '', ratingRatedAt: new Date() },
      include: chatInclude,
    });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to rate chat', error: error.message });
  }
};

export const sendChatTranscript = async (req, res) => {
  try {
    const { chatId } = req.params;
    const chat = await prisma.chat.findUnique({ where: { id: chatId }, include: chatInclude });
    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });

    const { sendEmail } = await import('../utils/emailService.js');
    const { chatTranscriptEmail, EMAIL_SUBJECTS } = await import('../utils/emailTemplates.js');

    const emailTemplate = chatTranscriptEmail(chat);
    await sendEmail(chat.userEmail, EMAIL_SUBJECTS.CHAT_TRANSCRIPT, emailTemplate.html, emailTemplate.text);

    res.status(200).json({ success: true, message: 'Chat transcript sent successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to send chat transcript', error: error.message });
  }
};
