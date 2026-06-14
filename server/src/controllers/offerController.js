import prisma from '../lib/prisma.js';

export const getOffers = async (req, res) => {
  try {
    const offers = await prisma.offer.findMany({ where: { isActive: true }, orderBy: { createdAt: 'desc' } });
    res.status(200).json({ success: true, count: offers.length, data: offers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

export const getOfferById = async (req, res) => {
  try {
    const offer = await prisma.offer.findUnique({ where: { id: req.params.id } });
    if (!offer) return res.status(404).json({ success: false, message: 'Offer not found' });
    res.status(200).json({ success: true, data: offer });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

export const createOffer = async (req, res) => {
  try {
    const offer = await prisma.offer.create({ data: req.body });
    res.status(201).json({ success: true, data: offer });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to create offer', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

export const updateOffer = async (req, res) => {
  try {
    const offer = await prisma.offer.update({ where: { id: req.params.id }, data: req.body });
    res.status(200).json({ success: true, data: offer });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ success: false, message: 'Offer not found' });
    res.status(400).json({ success: false, message: 'Failed to update offer', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

export const deleteOffer = async (req, res) => {
  try {
    await prisma.offer.delete({ where: { id: req.params.id } });
    res.status(200).json({ success: true, message: 'Offer deleted successfully' });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ success: false, message: 'Offer not found' });
    res.status(500).json({ success: false, message: 'Failed to delete offer', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};
