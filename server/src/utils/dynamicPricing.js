import prisma from '../lib/prisma.js';
import { getOccupancyRate } from './availabilityManager.js';

const calculateNights = (checkIn, checkOut) => {
  const ms = new Date(checkOut) - new Date(checkIn);
  return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
};

const isInPeakSeason = (hotel, checkInDate, checkOutDate) => {
  const peakDates = Array.isArray(hotel.peakSeasonDates) ? hotel.peakSeasonDates : [];
  for (const season of peakDates) {
    const start = new Date(season.startDate);
    const end = new Date(season.endDate);
    const checkIn = new Date(checkInDate);
    if (checkIn >= start && checkIn <= end) {
      return { inPeakSeason: true, reason: season.description || 'Peak Season' };
    }
  }
  return { inPeakSeason: false };
};

export const calculateDynamicPrice = async (hotelId, checkInDate, checkOutDate, roomTypeId = null) => {
  try {
    const hotel = await prisma.hotel.findUnique({ where: { id: hotelId } });
    if (!hotel) throw new Error('Hotel not found');

    let basePrice = hotel.basePricePerNight || hotel.pricePerNight;

    if (roomTypeId) {
      const rt = await prisma.roomType.findUnique({ where: { id: roomTypeId } });
      if (rt && rt.hotelId === hotelId) basePrice = rt.pricePerNight;
    }

    if (!basePrice) throw new Error('Hotel price not configured');

    const dynamicPricing = hotel.dynamicPricing || {};
    const nights = calculateNights(checkInDate, checkOutDate);

    if (!dynamicPricing.enabled) {
      return {
        basePrice,
        pricePerNight: basePrice,
        totalPrice: basePrice * nights,
        breakdown: { basePrice, finalPrice: basePrice, nights, factors: [] },
      };
    }

    let pricePerNight = basePrice;
    let multiplier = 1.0;
    const appliedFactors = [];

    const isPeak = isInPeakSeason(hotel, checkInDate, checkOutDate);
    if (isPeak.inPeakSeason) {
      const m = dynamicPricing.peakSeasonMultiplier || 1.5;
      multiplier *= m;
      appliedFactors.push({ name: 'Peak Season', description: isPeak.reason, multiplier: m });
    }

    try {
      const occupancy = await getOccupancyRate(hotelId, checkInDate);
      const rate = parseFloat(occupancy.occupancyRate);
      if (rate >= 80) {
        const m = dynamicPricing.highDemandMultiplier || 1.3;
        multiplier *= m;
        appliedFactors.push({ name: 'High Demand', description: `${rate}% occupancy`, multiplier: m });
      } else if (rate < 30) {
        const m = dynamicPricing.lowOccupancyDiscount || 0.9;
        multiplier *= m;
        appliedFactors.push({ name: 'Low Occupancy Discount', description: `${rate}% occupancy`, multiplier: m });
      }
    } catch { /* occupancy check non-critical */ }

    pricePerNight = Math.round(basePrice * multiplier * 100) / 100;
    const totalPrice = Math.round(pricePerNight * nights * 100) / 100;

    return {
      basePrice,
      pricePerNight,
      totalPrice,
      breakdown: { basePrice, multiplier, finalPrice: pricePerNight, nights, totalPrice, factors: appliedFactors },
    };
  } catch (error) {
    console.error('Dynamic pricing error:', error);
    throw error;
  }
};

export const getPriceCalendar = async (hotelId, startDate, daysCount = 30) => {
  const calendar = [];
  for (let i = 0; i < daysCount; i++) {
    const checkIn = new Date(startDate);
    checkIn.setDate(checkIn.getDate() + i);
    const checkOut = new Date(checkIn);
    checkOut.setDate(checkOut.getDate() + 1);

    try {
      const pricing = await calculateDynamicPrice(hotelId, checkIn, checkOut);
      calendar.push({ date: checkIn.toISOString().split('T')[0], pricePerNight: pricing.pricePerNight, factors: pricing.breakdown?.factors || [] });
    } catch {
      calendar.push({ date: checkIn.toISOString().split('T')[0], pricePerNight: null });
    }
  }
  return calendar;
};
