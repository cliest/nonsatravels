import express from 'express';
import { checkAvailability, getAvailabilityCalendar } from '../utils/availabilityManager.js';
import { calculateDynamicPrice, getPriceCalendar } from '../utils/dynamicPricing.js';

const router = express.Router();

// @desc    Check availability for specific dates
// @route   GET /api/availability/check/:hotelId
// @access  Public
router.get('/check/:hotelId', async (req, res) => {
  try {
    const { checkIn, checkOut, checkInDate, checkOutDate, rooms, roomsNeeded, excludeBookingId } = req.query;
    const checkInParam = checkIn || checkInDate;
    const checkOutParam = checkOut || checkOutDate;
    const roomsParam = roomsNeeded || rooms;

    if (!checkInParam || !checkOutParam) {
      return res.status(400).json({
        success: false,
        message: 'Check-in and check-out dates are required',
      });
    }

    const availability = await checkAvailability(
      req.params.hotelId,
      new Date(checkInParam),
      new Date(checkOutParam),
      parseInt(roomsParam) || 1,
      excludeBookingId || null
    );

    res.status(200).json({
      success: true,
      data: availability,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// @desc    Get availability calendar for a hotel
// @route   GET /api/availability/calendar/:hotelId
// @access  Public
router.get('/calendar/:hotelId', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required',
      });
    }

    const calendar = await getAvailabilityCalendar(
      req.params.hotelId,
      new Date(startDate),
      new Date(endDate)
    );

    res.status(200).json({
      success: true,
      data: calendar,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// @desc    Get dynamic pricing for specific dates
// @route   GET /api/availability/pricing/:hotelId
// @access  Public
router.get('/pricing/:hotelId', async (req, res) => {
  try {
    const { checkIn, checkOut, checkInDate, checkOutDate, roomTypeId } = req.query;
    const checkInParam = checkIn || checkInDate;
    const checkOutParam = checkOut || checkOutDate;

    if (!checkInParam || !checkOutParam) {
      return res.status(400).json({
        success: false,
        message: 'Check-in and check-out dates are required',
      });
    }

    const pricing = await calculateDynamicPrice(
      req.params.hotelId,
      new Date(checkInParam),
      new Date(checkOutParam),
      roomTypeId || null
    );

    res.status(200).json({
      success: true,
      data: pricing,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// @desc    Get price calendar for next 30 days
// @route   GET /api/availability/price-calendar/:hotelId
// @access  Public
router.get('/price-calendar/:hotelId', async (req, res) => {
  try {
    const { startDate, days } = req.query;
    const start = startDate ? new Date(startDate) : new Date();
    const daysCount = days ? parseInt(days) : 30;

    const priceCalendar = await getPriceCalendar(req.params.hotelId, start, daysCount);

    res.status(200).json({
      success: true,
      data: priceCalendar,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// @desc    Get combined availability and pricing data
// @route   GET /api/availability/full/:hotelId
// @access  Public
router.get('/full/:hotelId', async (req, res) => {
  try {
    const { checkInDate, checkOutDate, rooms } = req.query;

    if (!checkInDate || !checkOutDate) {
      return res.status(400).json({
        success: false,
        message: 'Check-in and check-out dates are required',
      });
    }

    const [availability, pricing] = await Promise.all([
      checkAvailability(
        req.params.hotelId,
        new Date(checkInDate),
        new Date(checkOutDate),
        parseInt(rooms) || 1
      ),
      calculateDynamicPrice(
        req.params.hotelId,
        new Date(checkInDate),
        new Date(checkOutDate)
      ),
    ]);

    res.status(200).json({
      success: true,
      data: {
        availability,
        pricing,
        canBook: availability.available,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

export default router;
