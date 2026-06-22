import prisma from '../lib/prisma.js';

const hotelInclude = { roomTypes: { orderBy: { pricePerNight: 'asc' } } };

const recomputeHotelPricing = async (hotelId) => {
  const roomTypes = await prisma.roomType.findMany({ where: { hotelId } });
  if (roomTypes.length === 0) return;
  const minPrice = Math.min(...roomTypes.map(rt => rt.pricePerNight));
  const totalRooms = roomTypes.reduce((sum, rt) => sum + rt.roomCount, 0);
  await prisma.hotel.update({
    where: { id: hotelId },
    data: { pricePerNight: minPrice, totalRooms },
  });
};

export const getHotels = async (req, res) => {
  try {
    const { city, search, minPrice, maxPrice, roomType, sortBy, limit } = req.query;

    const where = {};

    if (city) where.city = city;
    if (roomType) where.roomTypes = { some: { name: roomType } };
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
      include: hotelInclude,
    });

    res.status(200).json({ success: true, count: hotels.length, data: hotels });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

export const getHotel = async (req, res) => {
  try {
    const hotel = await prisma.hotel.findUnique({
      where: { id: req.params.id },
      include: hotelInclude,
    });

    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }

    res.status(200).json({ success: true, data: hotel });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

export const createHotel = async (req, res) => {
  try {
    const { roomTypes: roomTypesInput, ...hotelData } = req.body;

    if (roomTypesInput && roomTypesInput.length > 0) {
      hotelData.pricePerNight = Math.min(...roomTypesInput.map(rt => rt.pricePerNight));
      hotelData.totalRooms = roomTypesInput.reduce((sum, rt) => sum + (rt.roomCount || 1), 0);
      hotelData.roomType = roomTypesInput[0].name;
    }

    const hotel = await prisma.hotel.create({
      data: {
        ...hotelData,
        roomTypes: roomTypesInput?.length ? { create: roomTypesInput } : undefined,
      },
      include: hotelInclude,
    });

    res.status(201).json({ success: true, data: hotel });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to create hotel', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

export const updateHotel = async (req, res) => {
  try {
    const { roomTypes: roomTypesInput, ...hotelData } = req.body;

    if (roomTypesInput) {
      await prisma.roomType.deleteMany({ where: { hotelId: req.params.id } });
      if (roomTypesInput.length > 0) {
        await prisma.roomType.createMany({
          data: roomTypesInput.map(rt => ({ ...rt, hotelId: req.params.id })),
        });
        hotelData.pricePerNight = Math.min(...roomTypesInput.map(rt => rt.pricePerNight));
        hotelData.totalRooms = roomTypesInput.reduce((sum, rt) => sum + (rt.roomCount || 1), 0);
        hotelData.roomType = roomTypesInput[0].name;
      }
    }

    const hotel = await prisma.hotel.update({
      where: { id: req.params.id },
      data: hotelData,
      include: hotelInclude,
    });

    res.status(200).json({ success: true, data: hotel });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }
    res.status(400).json({ success: false, message: 'Failed to update hotel', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
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
    res.status(500).json({ success: false, message: 'Failed to delete hotel', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

export const getFeaturedHotels = async (req, res) => {
  try {
    const hotels = await prisma.hotel.findMany({
      where: { isFeatured: true },
      take: 3,
      include: hotelInclude,
    });
    res.status(200).json({ success: true, count: hotels.length, data: hotels });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
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
      include: hotelInclude,
    });
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

// Room Type CRUD
export const addRoomType = async (req, res) => {
  try {
    const rt = await prisma.roomType.create({
      data: { ...req.body, hotelId: req.params.hotelId },
    });
    await recomputeHotelPricing(req.params.hotelId);
    res.status(201).json({ success: true, data: rt });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to add room type', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

export const updateRoomType = async (req, res) => {
  try {
    const rt = await prisma.roomType.update({
      where: { id: req.params.roomTypeId },
      data: req.body,
    });
    await recomputeHotelPricing(rt.hotelId);
    res.status(200).json({ success: true, data: rt });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to update room type', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

export const deleteRoomType = async (req, res) => {
  try {
    const rt = await prisma.roomType.delete({ where: { id: req.params.roomTypeId } });
    await recomputeHotelPricing(rt.hotelId);
    res.status(200).json({ success: true, message: 'Room type deleted' });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to delete room type', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};
