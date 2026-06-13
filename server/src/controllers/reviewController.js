import prisma from '../lib/prisma.js';

export const getHotelReviews = async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { hotelId: req.params.hotelId },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
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

    const review = await prisma.review.create({ data: { hotelId, userId, userName, userAvatar: '', rating, comment } });

    const reviews = await prisma.review.findMany({ where: { hotelId } });
    const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
    await prisma.hotel.update({ where: { id: hotelId }, data: { rating: parseFloat(avgRating.toFixed(1)) } });

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to create review', error: error.message });
  }
};

export const updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const review = await prisma.review.update({
      where: { id: req.params.id },
      data: { rating, comment },
    });

    const reviews = await prisma.review.findMany({ where: { hotelId: review.hotelId } });
    const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
    await prisma.hotel.update({ where: { id: review.hotelId }, data: { rating: parseFloat(avgRating.toFixed(1)) } });

    res.status(200).json({ success: true, data: review });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ success: false, message: 'Review not found' });
    res.status(400).json({ success: false, message: 'Failed to update review', error: error.message });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const review = await prisma.review.delete({ where: { id: req.params.id } });

    const reviews = await prisma.review.findMany({ where: { hotelId: review.hotelId } });
    const avgRating = reviews.length > 0
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
      : 4.5;
    await prisma.hotel.update({ where: { id: review.hotelId }, data: { rating: parseFloat(avgRating.toFixed(1)) } });

    res.status(200).json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ success: false, message: 'Review not found' });
    res.status(500).json({ success: false, message: 'Failed to delete review', error: error.message });
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
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
