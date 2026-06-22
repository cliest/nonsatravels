import prisma from '../lib/prisma.js';

export const getHotelReviews = async (req, res) => {
  try {
    const isAdmin = req.user?.role === 'admin';
    const where = { hotelId: req.params.hotelId };
    if (!isAdmin) where.isApproved = true;

    const reviews = await prisma.review.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

export const getAllReviews = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const where = {};
    if (status === 'pending') where.isApproved = false;
    else if (status === 'approved') where.isApproved = true;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: { hotel: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
      }),
      prisma.review.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: reviews,
      pagination: { page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)), total },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const approveReview = async (req, res) => {
  try {
    const review = await prisma.review.update({
      where: { id: req.params.id },
      data: { isApproved: true },
    });

    const reviews = await prisma.review.findMany({ where: { hotelId: review.hotelId, isApproved: true } });
    if (reviews.length > 0) {
      const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
      await prisma.hotel.update({ where: { id: review.hotelId }, data: { rating: parseFloat(avgRating.toFixed(1)) } });
    }

    res.status(200).json({ success: true, data: review, message: 'Review approved' });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to approve review' });
  }
};

export const rejectReview = async (req, res) => {
  try {
    const review = await prisma.review.delete({ where: { id: req.params.id } });

    const reviews = await prisma.review.findMany({ where: { hotelId: review.hotelId, isApproved: true } });
    const avgRating = reviews.length > 0
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
      : 4.5;
    await prisma.hotel.update({ where: { id: review.hotelId }, data: { rating: parseFloat(avgRating.toFixed(1)) } });

    res.status(200).json({ success: true, message: 'Review rejected and removed' });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to reject review' });
  }
};

export const createReview = async (req, res) => {
  try {
    const { hotelId, rating, comment } = req.body;
    const userId = req.user.id;
    const userName = req.user.fullName;

    const hotel = await prisma.hotel.findUnique({ where: { id: hotelId } });
    if (!hotel) return res.status(404).json({ success: false, message: 'Hotel not found' });

    const existingReview = await prisma.review.findUnique({ where: { hotelId_userId: { hotelId, userId } } });
    if (existingReview) return res.status(400).json({ success: false, message: 'You have already reviewed this hotel' });

    const review = await prisma.review.create({ data: { hotelId, userId, userName, userAvatar: '', rating, comment, isApproved: false } });

    res.status(201).json({ success: true, data: review, message: 'Review submitted! It will appear after admin approval.' });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to create review', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

export const updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const existing = await prisma.review.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ success: false, message: 'Review not found' });
    if (req.user.role !== 'admin' && existing.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this review' });
    }

    const review = await prisma.review.update({
      where: { id: req.params.id },
      data: { rating, comment, isApproved: false },
    });

    res.status(200).json({ success: true, data: review });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ success: false, message: 'Review not found' });
    res.status(400).json({ success: false, message: 'Failed to update review', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const existing = await prisma.review.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ success: false, message: 'Review not found' });
    if (req.user.role !== 'admin' && existing.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this review' });
    }

    const review = await prisma.review.delete({ where: { id: req.params.id } });

    const reviews = await prisma.review.findMany({ where: { hotelId: review.hotelId, isApproved: true } });
    const avgRating = reviews.length > 0
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
      : 4.5;
    await prisma.hotel.update({ where: { id: review.hotelId }, data: { rating: parseFloat(avgRating.toFixed(1)) } });

    res.status(200).json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ success: false, message: 'Review not found' });
    res.status(500).json({ success: false, message: 'Failed to delete review', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

export const markReviewHelpful = async (req, res) => {
  try {
    const review = await prisma.review.update({
      where: { id: req.params.id },
      data: { helpful: { increment: 1 } },
    });
    res.status(200).json({ success: true, data: review });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ success: false, message: 'Review not found' });
    res.status(500).json({ success: false, message: 'Server error', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};
