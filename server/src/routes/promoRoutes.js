import express from 'express';
import prisma from '../lib/prisma.js';
import { verifyAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

const calculateDiscount = (promo, amount) => {
  if (amount < promo.minBookingAmount) return 0;
  let discount = promo.discountType === 'percentage' ? (amount * promo.discountValue) / 100 : promo.discountValue;
  if (promo.maxDiscount !== null && discount > promo.maxDiscount) discount = promo.maxDiscount;
  if (discount > amount) discount = amount;
  return Math.round(discount * 100) / 100;
};

// @route   POST /api/promo/validate
router.post('/validate', verifyAuth, async (req, res) => {
  try {
    const { code, bookingAmount, hotelId } = req.body;
    const userId = req.user.id;
    if (!code) return res.status(400).json({ success: false, message: 'Promo code is required' });

    const promo = await prisma.promoCode.findFirst({
      where: { code: code.toUpperCase(), isActive: true },
      include: { usedBy: true },
    });

    if (!promo) return res.status(404).json({ success: false, message: 'Invalid promo code' });

    const now = new Date();
    if (now < promo.validFrom) return res.status(400).json({ success: false, message: 'This promo code is not yet active' });
    if (now > promo.validUntil) return res.status(400).json({ success: false, message: 'This promo code has expired' });
    if (promo.usageLimit !== null && promo.usageCount >= promo.usageLimit) {
      return res.status(400).json({ success: false, message: 'This promo code has reached its usage limit' });
    }

    const userUsages = promo.usedBy.filter((u) => u.userId === userId).length;
    if (userUsages >= promo.usagePerUser) {
      return res.status(400).json({ success: false, message: 'You have already used this promo code' });
    }

    if (bookingAmount && bookingAmount < promo.minBookingAmount) {
      return res.status(400).json({ success: false, message: `Minimum booking amount of $${promo.minBookingAmount} required` });
    }

    if (promo.applicableHotels.length > 0 && hotelId && !promo.applicableHotels.includes(hotelId)) {
      return res.status(400).json({ success: false, message: 'This promo code is not valid for the selected hotel' });
    }

    if (promo.isFirstBookingOnly) {
      const existingBookings = await prisma.booking.count({
        where: { userId, status: { notIn: ['cancelled', 'rejected'] } },
      });
      if (existingBookings > 0) {
        return res.status(400).json({ success: false, message: 'This promo code is only valid for first-time bookings' });
      }
    }

    const discount = bookingAmount ? calculateDiscount(promo, bookingAmount) : 0;

    res.status(200).json({
      success: true,
      message: 'Promo code applied successfully!',
      data: {
        code: promo.code, description: promo.description, discountType: promo.discountType,
        discountValue: promo.discountValue, discount, maxDiscount: promo.maxDiscount,
        minBookingAmount: promo.minBookingAmount, finalAmount: bookingAmount ? Math.max(0, bookingAmount - discount) : null,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to validate promo code' });
  }
});

// @route   POST /api/promo/apply
router.post('/apply', verifyAuth, async (req, res) => {
  try {
    const { code, bookingId } = req.body;
    const userId = req.user.id;

    const promo = await prisma.promoCode.findFirst({ where: { code: code.toUpperCase(), isActive: true } });
    if (!promo) return res.status(404).json({ success: false, message: 'Invalid promo code' });

    await prisma.promoCode.update({
      where: { id: promo.id },
      data: {
        usageCount: { increment: 1 },
        usedBy: { create: { userId, bookingId, usedAt: new Date() } },
      },
    });

    res.status(200).json({ success: true, message: 'Promo code applied to booking' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to apply promo code' });
  }
});

// @route   GET /api/promo
router.get('/', verifyAuth, requireAdmin, async (req, res) => {
  try {
    const promoCodes = await prisma.promoCode.findMany({ orderBy: { createdAt: 'desc' }, include: { usedBy: true } });
    res.status(200).json({ success: true, data: promoCodes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch promo codes' });
  }
});

// @route   POST /api/promo
router.post('/', verifyAuth, requireAdmin, async (req, res) => {
  try {
    const { code, description, discountType, discountValue, minBookingAmount, maxDiscount,
      validFrom, validUntil, usageLimit, usagePerUser, applicableHotels, isFirstBookingOnly } = req.body;

    const existing = await prisma.promoCode.findUnique({ where: { code: code.toUpperCase() } });
    if (existing) return res.status(400).json({ success: false, message: 'A promo code with this code already exists' });

    const promo = await prisma.promoCode.create({
      data: {
        code: code.toUpperCase(), description, discountType, discountValue,
        minBookingAmount: minBookingAmount || 0, maxDiscount: maxDiscount || null,
        validFrom: new Date(validFrom), validUntil: new Date(validUntil),
        usageLimit: usageLimit || null, usagePerUser: usagePerUser || 1,
        applicableHotels: applicableHotels || [], isFirstBookingOnly: isFirstBookingOnly || false,
        createdBy: req.user.id,
      },
    });

    res.status(201).json({ success: true, message: 'Promo code created successfully', data: promo });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to create promo code' });
  }
});

// @route   PUT /api/promo/:id
router.put('/:id', verifyAuth, requireAdmin, async (req, res) => {
  try {
    const promo = await prisma.promoCode.update({ where: { id: req.params.id }, data: req.body });
    res.status(200).json({ success: true, message: 'Promo code updated successfully', data: promo });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ success: false, message: 'Promo code not found' });
    res.status(500).json({ success: false, message: 'Failed to update promo code' });
  }
});

// @route   DELETE /api/promo/:id
router.delete('/:id', verifyAuth, requireAdmin, async (req, res) => {
  try {
    await prisma.promoCode.delete({ where: { id: req.params.id } });
    res.status(200).json({ success: true, message: 'Promo code deleted successfully' });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ success: false, message: 'Promo code not found' });
    res.status(500).json({ success: false, message: 'Failed to delete promo code' });
  }
});

export default router;
