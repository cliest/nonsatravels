import { Server } from 'socket.io';
import prisma from '../lib/prisma.js';

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  const connectedUsers = new Map();
  const connectedAdmins = new Map();

  io.on('connection', (socket) => {
    socket.on('join-chat', async ({ chatId, userId, isAdmin = false }) => {
      try {
        socket.join(chatId);

        if (isAdmin) {
          connectedAdmins.set(userId, socket.id);
        } else {
          connectedUsers.set(userId, socket.id);
        }

        const chat = await prisma.chat.findUnique({
          where: { id: chatId },
          include: { messages: { orderBy: { timestamp: 'asc' } } },
        });

        if (chat) socket.emit('chat-history', chat);
        socket.to(chatId).emit('user-joined', { userId, isAdmin });
      } catch (error) {
        console.error('Error joining chat:', error);
        socket.emit('error', { message: 'Failed to join chat' });
      }
    });

    socket.on('send-message', async (data) => {
      try {
        const { chatId, sender, senderName, senderId, message } = data;

        const chat = await prisma.chat.findUnique({ where: { id: chatId } });
        if (!chat) { socket.emit('error', { message: 'Chat not found' }); return; }

        const newMsg = await prisma.chatMessage.create({
          data: { chatId, sender, senderName, senderId, message, timestamp: new Date(), read: false },
        });

        const updateData = { lastMessageAt: new Date() };
        if (sender === 'user') {
          updateData.unreadUserMessages = { increment: 1 };
          updateData.status = 'active';
        } else {
          updateData.unreadAdminMessages = { increment: 1 };
        }

        await prisma.chat.update({ where: { id: chatId }, data: updateData });

        io.to(chatId).emit('new-message', newMsg);

        if (sender === 'user') {
          io.emit('admin-notification', { type: 'new-message', chatId, userName: senderName, message });
        }
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('typing', ({ chatId, userName, isAdmin }) => {
      socket.to(chatId).emit('user-typing', { userName, isAdmin });
    });

    socket.on('stop-typing', ({ chatId }) => {
      socket.to(chatId).emit('user-stop-typing');
    });

    socket.on('mark-read', async ({ chatId, reader }) => {
      try {
        const senderToMark = reader === 'user' ? 'admin' : 'user';
        const result = await prisma.chatMessage.updateMany({
          where: { chatId, sender: senderToMark, read: false },
          data: { read: true },
        });

        if (result.count > 0) {
          const resetField = reader === 'user' ? { unreadAdminMessages: 0 } : { unreadUserMessages: 0 };
          await prisma.chat.update({ where: { id: chatId }, data: resetField });
          io.to(chatId).emit('messages-read', { reader });
        }
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });

    socket.on('update-status', async ({ chatId, status, assignedTo }) => {
      try {
        const data = {};
        if (status) data.status = status;
        if (assignedTo !== undefined) data.assignedTo = assignedTo;

        await prisma.chat.update({ where: { id: chatId }, data });
        io.to(chatId).emit('status-updated', { status, assignedTo });
      } catch (error) {
        console.error('Error updating chat status:', error);
      }
    });

    socket.on('disconnect', () => {
      for (const [userId, socketId] of connectedUsers.entries()) {
        if (socketId === socket.id) { connectedUsers.delete(userId); break; }
      }
      for (const [adminId, socketId] of connectedAdmins.entries()) {
        if (socketId === socket.id) { connectedAdmins.delete(adminId); break; }
      }
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
};
