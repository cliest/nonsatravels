import prisma from '../lib/prisma.js';

export const getAllCannedResponses = async (req, res) => {
  try {
    const { category, isActive } = req.query;
    const where = {};
    if (category) where.category = category;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const responses = await prisma.cannedResponse.findMany({
      where,
      orderBy: [{ usageCount: 'desc' }, { title: 'asc' }],
    });
    res.status(200).json({ success: true, data: responses });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get canned responses', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

export const createCannedResponse = async (req, res) => {
  try {
    const { title, message, category, shortcut } = req.body;
    if (!title || !message) return res.status(400).json({ success: false, message: 'Title and message are required' });

    const response = await prisma.cannedResponse.create({
      data: { title, message, category, shortcut, createdBy: req.user.id },
    });
    res.status(201).json({ success: true, data: response });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create canned response', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

export const updateCannedResponse = async (req, res) => {
  try {
    const { title, message, category, shortcut, isActive } = req.body;
    const response = await prisma.cannedResponse.update({
      where: { id: req.params.id },
      data: { title, message, category, shortcut, isActive },
    });
    res.status(200).json({ success: true, data: response });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ success: false, message: 'Canned response not found' });
    res.status(500).json({ success: false, message: 'Failed to update canned response', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

export const deleteCannedResponse = async (req, res) => {
  try {
    await prisma.cannedResponse.delete({ where: { id: req.params.id } });
    res.status(200).json({ success: true, message: 'Canned response deleted successfully' });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ success: false, message: 'Canned response not found' });
    res.status(500).json({ success: false, message: 'Failed to delete canned response', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

export const incrementUsageCount = async (req, res) => {
  try {
    const response = await prisma.cannedResponse.update({
      where: { id: req.params.id },
      data: { usageCount: { increment: 1 } },
    });
    res.status(200).json({ success: true, data: response });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ success: false, message: 'Canned response not found' });
    res.status(500).json({ success: false, message: 'Failed to increment usage count', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};
