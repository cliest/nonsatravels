import prisma from '../lib/prisma.js';

export const checkAvailability = async (hotelId, checkInDate, checkOutDate, requestedRooms = 1, excludeBookingId = null) => {
  try {
    const hotel = await prisma.hotel.findUnique({ where: { id: hotelId } });
    if (!hotel) throw new Error('Hotel not found');

    if (!hotel.isAvailable) {
      return { available: false, availableRooms: 0, totalRooms: hotel.totalRooms, message: 'Hotel is currently unavailable' };
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    const where = {
      hotelId,
      status: { in: ['pending_payment', 'payment_confirmed', 'confirmed', 'completed'] },
      OR: [
        { checkInDate: { gte: checkIn, lt: checkOut } },
        { checkOutDate: { gt: checkIn, lte: checkOut } },
        { checkInDate: { lte: checkIn }, checkOutDate: { gte: checkOut } },
      ],
    };

    if (excludeBookingId) {
      where.id = { not: excludeBookingId };
    }

    const bookedRooms = await prisma.booking.count({ where });
    const availableRooms = hotel.totalRooms - bookedRooms;

    return {
      available: availableRooms >= requestedRooms,
      availableRooms: Math.max(0, availableRooms),
      totalRooms: hotel.totalRooms,
      bookedRooms,
      requestedRooms,
    };
  } catch (error) {
    console.error('Error checking availability:', error);
    throw error;
  }
};

export const getAvailabilityCalendar = async (hotelId, startDate, endDate) => {
  try {
    const hotel = await prisma.hotel.findUnique({ where: { id: hotelId } });
    if (!hotel) throw new Error('Hotel not found');

    const start = new Date(startDate);
    const end = new Date(endDate);

    const bookings = await prisma.booking.findMany({
      where: {
        hotelId,
        status: { in: ['pending_payment', 'payment_confirmed', 'confirmed', 'completed'] },
        OR: [
          { checkInDate: { gte: start, lte: end } },
          { checkOutDate: { gte: start, lte: end } },
          { checkInDate: { lte: start }, checkOutDate: { gte: end } },
        ],
      },
    });

    const calendar = [];
    let currentDate = new Date(start);

    while (currentDate <= end) {
      const bookedRooms = bookings.filter((b) => {
        const checkIn = new Date(b.checkInDate);
        const checkOut = new Date(b.checkOutDate);
        return currentDate >= checkIn && currentDate < checkOut;
      }).length;

      const availableRooms = hotel.totalRooms - bookedRooms;

      calendar.push({
        date: currentDate.toISOString().split('T')[0],
        availableRooms: Math.max(0, availableRooms),
        totalRooms: hotel.totalRooms,
        isAvailable: availableRooms > 0 && hotel.isAvailable,
        occupancyRate: ((bookedRooms / hotel.totalRooms) * 100).toFixed(2),
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return calendar;
  } catch (error) {
    console.error('Error getting availability calendar:', error);
    throw error;
  }
};

export const reserveRooms = async (hotelId, checkInDate, checkOutDate, rooms = 1) => {
  try {
    const availability = await checkAvailability(hotelId, checkInDate, checkOutDate, rooms);
    if (!availability.available) {
      throw new Error(`Only ${availability.availableRooms} room(s) available. Requested ${rooms} room(s).`);
    }
    return true;
  } catch (error) {
    console.error('Error reserving rooms:', error);
    throw error;
  }
};

export const releaseRooms = async (bookingId) => {
  try {
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new Error('Booking not found');
    if (booking.status !== 'cancelled') throw new Error('Only cancelled bookings can release rooms');
    return true;
  } catch (error) {
    console.error('Error releasing rooms:', error);
    throw error;
  }
};

export const getOccupancyRate = async (hotelId, date) => {
  try {
    const hotel = await prisma.hotel.findUnique({ where: { id: hotelId } });
    if (!hotel) throw new Error('Hotel not found');

    const d = new Date(date);

    const bookedRooms = await prisma.booking.count({
      where: {
        hotelId,
        status: { in: ['payment_confirmed', 'confirmed', 'completed'] },
        checkInDate: { lte: d },
        checkOutDate: { gt: d },
      },
    });

    const availableRooms = hotel.totalRooms - bookedRooms;
    const occupancyRate = (bookedRooms / hotel.totalRooms) * 100;

    return { occupancyRate: occupancyRate.toFixed(2), bookedRooms, availableRooms, totalRooms: hotel.totalRooms };
  } catch (error) {
    console.error('Error calculating occupancy rate:', error);
    throw error;
  }
};
