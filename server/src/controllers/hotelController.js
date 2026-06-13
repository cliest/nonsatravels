import prisma from '../lib/prisma.js';

export const getHotels = async (req, res) => {
  try {
    const { city, search, minPrice, maxPrice, roomType, sortBy, limit } = req.query;

    const where = {};

    if (city) where.city = city;
    if (roomType) where.roomType = roomType;
    if (minPrice || maxPrice) {
      where.pricePerNight = {};
      if (minPrice) where.pricePerNight.gte = Number(minPrice);
      if (maxPrice) where.pricePerNight.lte = Number(maxPrice);
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
      ];
    }

    let orderBy = { createdAt: 'desc' };
    if (sortBy === 'priceAsc') orderBy = { pricePerNight: 'asc' };
    else if (sortBy === 'priceDesc') orderBy = { pricePerNight: 'desc' };
    else if (sortBy === 'ratingDesc') orderBy = { rating: 'desc' };

    const hotels = await prisma.hotel.findMany({
      where,
      orderBy,
      take: Number(limit) || 100,
    });

    res.status(200).json({ success: true, count: hotels.length, data: hotels });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const getHotel = async (req, res) => {
  try {
    const hotel = await prisma.hotel.findUnique({ where: { id: req.params.id } });

    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }

    res.status(200).json({ success: true, data: hotel });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const createHotel = async (req, res) => {
  try {
    const hotel = await prisma.hotel.create({ data: req.body });
    res.status(201).json({ success: true, data: hotel });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to create hotel', error: error.message });
  }
};

export const updateHotel = async (req, res) => {
  try {
    const hotel = await prisma.hotel.update({
      where: { id: req.params.id },
      data: req.body,
    });

    res.status(200).json({ success: true, data: hotel });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }
    res.status(400).json({ success: false, message: 'Failed to update hotel', error: error.message });
  }
};

export const deleteHotel = async (req, res) => {
  try {
    await prisma.hotel.delete({ where: { id: req.params.id } });
    res.status(200).json({ success: true, message: 'Hotel deleted successfully' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }
    res.status(500).json({ success: false, message: 'Failed to delete hotel', error: error.message });
  }
};

export const getFeaturedHotels = async (req, res) => {
  try {
    const hotels = await prisma.hotel.findMany({ where: { isFeatured: true }, take: 3 });
    res.status(200).json({ success: true, count: hotels.length, data: hotels });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const toggleFeatured = async (req, res) => {
  try {
    const hotel = await prisma.hotel.findUnique({ where: { id: req.params.id } });

    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }

    const updated = await prisma.hotel.update({
      where: { id: req.params.id },
      data: { isFeatured: !hotel.isFeatured },
    });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
