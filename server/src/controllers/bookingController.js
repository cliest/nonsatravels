import prisma from '../lib/prisma.js';
import { sendEmail } from '../utils/emailService.js';
import {
  bookingStatusUpdatedEmail,
  bankDetailsEmail,
  bookingModificationEmail,
} from '../utils/emailTemplates.js';
import {
  enhancedBookingConfirmationEmail,
  bookingReminderEmail,
  bookingCancellationEmail,
  adminNewBookingNotification,
  paymentConfirmedEmail,
} from '../utils/enhancedEmailTemplates.js';
import { sendWhatsAppMessage, sendWhatsAppToCustomer, whatsappTemplates } from '../utils/whatsappService.js';
import { checkAvailability, reserveRooms } from '../utils/availabilityManager.js';
import { calculateDynamicPrice } from '../utils/dynamicPricing.js';
import { applyReferralDiscount } from './referralController.js';
import { awardPoints } from './loyaltyController.js';
import {
  generateInvoiceNumber,
  generateInvoicePDF,
  generateInvoiceHTML,
} from '../utils/invoiceGenerator.js';

// Transforms a Prisma booking (with hotel relation) to match the legacy shape
// that email templates and other code expect (hotelId = hotel object, _id = id)
const formatBooking = (booking) => {
  if (!booking) return null;
  const { hotel, ...rest } = booking;
  return { ...rest, _id: booking.id, hotelId: hotel ?? booking.hotelId };
};

const bookingInclude = { hotel: true };

export const getBookings = async (req, res) => {
  try {
    const { userId, status } = req.query;
    const isAdmin = req.user && req.user.role === 'admin';

    const where = {};

    if (req.user && !isAdmin && !userId) {
      where.userId = req.user.id;
    } else if (userId) {
      where.userId = userId;
    }

    if (status) where.status = status;

    const bookings = await prisma.booking.findMany({
      where,
      include: bookingInclude,
      orderBy: { createdAt: 'desc' },
    });

    const formatted = bookings.map(formatBooking);
    res.status(200).json({ success: true, count: formatted.length, data: formatted });
  } catch (error) {
    console.error('getBookings error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const getBooking = async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: bookingInclude,
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.status(200).json({ success: true, data: formatBooking(booking) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const createBooking = async (req, res) => {
  try {
    const {
      hotelId, checkInDate, checkOutDate, guests, paymentId, paymentMethod,
      paymentStatus, roomsRequested, referralCode, userName: guestName,
      userEmail: guestEmail, userPhone, specialRequests, roomPreferences, totalPrice,
    } = req.body;

    const userId = req.user?.id || null;
    const userName = req.user?.fullName || guestName;
    const userEmail = req.user?.email || guestEmail;

    if (!userName || !userEmail) {
      return res.status(400).json({
        success: false,
        message: 'User name and email are required. Please provide guest information or log in.',
      });
    }

    const hotel = await prisma.hotel.findUnique({ where: { id: hotelId } });
    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }

    const availability = await checkAvailability(hotelId, checkInDate, checkOutDate, roomsRequested || 1);
    if (!availability.available) {
      return res.status(400).json({
        success: false,
        message: `Sorry, only ${availability.availableRooms} room(s) available for selected dates.`,
        availableRooms: availability.availableRooms,
        totalRooms: availability.totalRooms,
      });
    }

    const pricing = await calculateDynamicPrice(hotelId, checkInDate, checkOutDate);
    let finalPrice = pricing.totalPrice || totalPrice;
    let discountApplied = null;

    if (!finalPrice || isNaN(finalPrice) || finalPrice <= 0) {
      return res.status(400).json({ success: false, message: 'Unable to calculate booking price.' });
    }

    if (referralCode) {
      const referralResult = await applyReferralDiscount(userId, userEmail, null, pricing.totalPrice, referralCode);
      if (referralResult.applied) {
        finalPrice = referralResult.finalPrice;
        discountApplied = { code: referralCode, amount: referralResult.discountAmount, message: referralResult.message };
      }
    }

    await reserveRooms(hotelId, checkInDate, checkOutDate, roomsRequested || 1);

    const booking = await prisma.booking.create({
      data: {
        userId,
        hotelId,
        checkInDate: new Date(checkInDate),
        checkOutDate: new Date(checkOutDate),
        guests,
        totalPrice: finalPrice,
        pricePerNight: pricing.pricePerNight,
        userName,
        userEmail,
        userPhone,
        specialRequests,
        roomPreferences,
        paymentId,
        paymentMethod,
        paymentStatus: paymentStatus || 'pending',
        status: paymentStatus === 'completed' ? 'payment_confirmed' : 'pending_payment',
        pricingDetails: pricing.breakdown,
        referralDiscount: discountApplied,
      },
      include: bookingInclude,
    });

    if (discountApplied) {
      await applyReferralDiscount(userId, userEmail, booking.id, pricing.totalPrice, referralCode);
    }

    let populatedBooking = formatBooking(booking);

    // Generate invoice
    let invoicePDF = null;
    try {
      if (!populatedBooking.invoiceNumber) {
        const invoiceNumber = generateInvoiceNumber();
        const updated = await prisma.booking.update({
          where: { id: booking.id },
          data: { invoiceNumber, invoiceGeneratedAt: new Date() },
          include: bookingInclude,
        });
        populatedBooking = formatBooking(updated);
      }
      invoicePDF = await generateInvoicePDF(populatedBooking, hotel);
    } catch (invoiceError) {
      console.error('Failed to generate invoice:', invoiceError);
    }

    // Send emails
    const attachments = invoicePDF
      ? [{ filename: `Invoice-${populatedBooking.invoiceNumber}.pdf`, content: invoicePDF }]
      : [];

    if (paymentMethod === 'bank_transfer') {
      try {
        const bankDetails = {
          bankName: 'Stanbic Bank Zambia',
          accountName: 'Nonsa Travels Ltd',
          accountNumber: '9200001234567',
          branchCode: '040001',
          swiftCode: 'SBICZMLX',
          additionalInfo: 'Please use your Booking ID as the payment reference',
        };
        const emailContent = bankDetailsEmail(populatedBooking, hotel, bankDetails);
        await sendEmail({ to: userEmail, subject: emailContent.subject, html: emailContent.html, text: emailContent.text, attachments });
        await prisma.booking.update({ where: { id: booking.id }, data: { bankDetailsSentAt: new Date() } });
        // Send bank details via WhatsApp if customer provided a number
        if (populatedBooking.userPhone) {
          await sendWhatsAppToCustomer(populatedBooking.userPhone, whatsappTemplates.bankDetails(populatedBooking, hotel, bankDetails));
        }
      } catch (e) { console.error('Failed to send bank details:', e); }

      try {
        const adminEmailContent = adminNewBookingNotification(populatedBooking, hotel);
        await sendEmail({ to: process.env.ADMIN_EMAIL || 'admin@nonsatravels.com', subject: adminEmailContent.subject, html: adminEmailContent.html, text: adminEmailContent.text });
        await sendWhatsAppMessage(`New booking received:\nHotel: ${hotel.name}\nGuest: ${populatedBooking.userName}\nCheck-in: ${new Date(populatedBooking.checkInDate).toLocaleDateString()}\nTotal: $${populatedBooking.totalPrice}`);
      } catch (e) { console.error('Failed to send admin notification:', e); }
    } else {
      try {
        const emailContent = enhancedBookingConfirmationEmail(populatedBooking, hotel);
        await sendEmail({ to: userEmail, subject: emailContent.subject, html: emailContent.html, text: emailContent.text, attachments });
        // Send booking confirmation via WhatsApp
        if (populatedBooking.userPhone) {
          await sendWhatsAppToCustomer(populatedBooking.userPhone, whatsappTemplates.cashBooking(populatedBooking, hotel));
        }
      } catch (e) { console.error('Failed to send confirmation:', e); }

      try {
        const adminEmailContent = adminNewBookingNotification(populatedBooking, hotel);
        await sendEmail({ to: process.env.ADMIN_EMAIL || 'admin@nonsatravels.com', subject: adminEmailContent.subject, html: adminEmailContent.html, text: adminEmailContent.text });
        await sendWhatsAppMessage(`New booking received:\nHotel: ${hotel.name}\nGuest: ${populatedBooking.userName}\nTotal: $${populatedBooking.totalPrice}`);
      } catch (e) { console.error('Failed to send admin notification:', e); }
    }

    res.status(201).json({ success: true, data: populatedBooking });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to create booking', error: error.message });
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const oldBooking = await prisma.booking.findUnique({ where: { id: req.params.id }, include: bookingInclude });
    if (!oldBooking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const oldStatus = oldBooking.status;
    const updateData = { status };

    if (status === 'payment_confirmed' && oldStatus === 'pending_payment') {
      updateData.paymentStatus = 'completed';
      updateData.paymentConfirmedAt = new Date();
      updateData.paymentConfirmedBy = req.user?.email || 'admin';
    }

    if (status === 'confirmed' && !oldBooking.invoiceNumber) {
      updateData.invoiceNumber = generateInvoiceNumber();
      updateData.invoiceGeneratedAt = new Date();
    }

    const updated = await prisma.booking.update({
      where: { id: req.params.id },
      data: updateData,
      include: bookingInclude,
    });

    const booking = formatBooking(updated);
    const hotel = updated.hotel;

    let invoicePDF = null;
    if (status === 'confirmed' && oldStatus !== 'confirmed' && hotel && !oldBooking.invoiceGeneratedAt) {
      try {
        invoicePDF = await generateInvoicePDF(booking, hotel);
      } catch (e) { console.error('Failed to generate invoice PDF:', e); }
    }

    try {
      if (status === 'payment_confirmed' && oldStatus === 'pending_payment') {
        const content = paymentConfirmedEmail(booking, hotel);
        await sendEmail({ to: booking.userEmail, subject: content.subject, html: content.html, text: content.text });
        if (booking.userPhone) {
          await sendWhatsAppToCustomer(booking.userPhone, whatsappTemplates.paymentConfirmed(booking, hotel));
        }
      } else if (status === 'confirmed' && oldStatus !== 'confirmed') {
        const content = enhancedBookingConfirmationEmail(booking, hotel, booking.pricingDetails);
        const attachments = invoicePDF ? [{ filename: `Invoice-${booking.invoiceNumber}.pdf`, content: invoicePDF }] : [];
        await sendEmail({ to: booking.userEmail, subject: `Booking Confirmed - ${content.subject}`, html: content.html, text: content.text, attachments });
        if (booking.userPhone) {
          await sendWhatsAppToCustomer(booking.userPhone, whatsappTemplates.bookingConfirmed(booking, hotel));
        }
      } else if (oldStatus !== status) {
        const content = bookingStatusUpdatedEmail(booking, hotel, oldStatus, status);
        await sendEmail({ to: booking.userEmail, subject: content.subject, html: content.html, text: content.text });
      }
    } catch (e) { console.error('Failed to send status update:', e); }

    if (status === 'completed' && oldStatus !== 'completed') {
      try {
        await awardPoints(booking.userId, booking.id, booking.totalPrice);
      } catch (e) { console.error('Failed to award loyalty points:', e); }
    }

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to update booking', error: error.message });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const raw = await prisma.booking.findUnique({ where: { id: req.params.id }, include: bookingInclude });
    if (!raw) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const checkIn = new Date(raw.checkInDate);
    const now = new Date();
    const daysUntilCheckIn = Math.ceil((checkIn - now) / (1000 * 60 * 60 * 24));

    let refundAmount = 0;
    let refundReason = '';
    if (daysUntilCheckIn > 7) {
      refundAmount = raw.totalPrice;
      refundReason = 'Full refund (cancelled more than 7 days before check-in)';
    } else if (daysUntilCheckIn > 2) {
      refundAmount = raw.totalPrice * 0.5;
      refundReason = '50% refund (cancelled 3-7 days before check-in)';
    } else {
      refundReason = 'No refund (cancelled less than 2 days before check-in)';
    }

    const updated = await prisma.booking.update({
      where: { id: req.params.id },
      data: { status: 'cancelled', paymentStatus: refundAmount > 0 ? 'refunded' : 'no_refund' },
      include: bookingInclude,
    });

    const booking = formatBooking(updated);

    try {
      const content = bookingCancellationEmail(booking, updated.hotel, refundAmount, refundReason);
      await sendEmail({ to: booking.userEmail, subject: content.subject, html: content.html, text: content.text });
    } catch (e) { console.error('Failed to send cancellation email:', e); }

    res.status(200).json({ success: true, message: 'Booking cancelled successfully', data: booking, refundAmount, refundReason });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to cancel booking', error: error.message });
  }
};

export const deleteBookingPermanently = async (req, res) => {
  try {
    const booking = await prisma.booking.delete({ where: { id: req.params.id } });
    res.status(200).json({ success: true, message: 'Booking deleted permanently', data: booking });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    res.status(500).json({ success: false, message: 'Failed to delete booking', error: error.message });
  }
};

export const sendBankDetails = async (req, res) => {
  try {
    const { bankName, accountName, accountNumber, branchCode, swiftCode, additionalInfo } = req.body;

    if (!bankName || !accountName || !accountNumber) {
      return res.status(400).json({ success: false, message: 'Bank name, account name, and account number are required' });
    }

    const raw = await prisma.booking.findUnique({ where: { id: req.params.id }, include: bookingInclude });
    if (!raw) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (raw.paymentMethod !== 'bank_transfer') {
      return res.status(400).json({ success: false, message: 'This booking does not use bank transfer payment method' });
    }

    const bankDetails = { bankName, accountName, accountNumber, branchCode: branchCode || null, swiftCode: swiftCode || null, additionalInfo: additionalInfo || null };

    const updated = await prisma.booking.update({
      where: { id: req.params.id },
      data: { bankDetails, bankDetailsSentAt: new Date() },
      include: bookingInclude,
    });

    const booking = formatBooking(updated);

    try {
      const content = bankDetailsEmail(booking, updated.hotel, bankDetails);
      await sendEmail({ to: booking.userEmail, subject: content.subject, html: content.html, text: content.text });
      // Also send via WhatsApp if customer has a phone number
      if (booking.userPhone) {
        await sendWhatsAppToCustomer(booking.userPhone, whatsappTemplates.bankDetails(booking, updated.hotel, bankDetails));
      }
      const whatsappNote = booking.userPhone ? ' and WhatsApp' : '';
      res.status(200).json({ success: true, message: `Bank details sent via email${whatsappNote}`, data: booking });
    } catch (emailError) {
      console.error('Failed to send bank details:', emailError);
      res.status(500).json({ success: false, message: 'Failed to send bank details', error: emailError.message });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const modifyBooking = async (req, res) => {
  try {
    const { checkInDate, checkOutDate, guests, roomsRequested } = req.body;

    const oldRaw = await prisma.booking.findUnique({ where: { id: req.params.id }, include: bookingInclude });
    if (!oldRaw) return res.status(404).json({ success: false, message: 'Booking not found' });

    if (!['pending_payment', 'payment_confirmed', 'confirmed'].includes(oldRaw.status)) {
      return res.status(400).json({ success: false, message: `Cannot modify booking with status: ${oldRaw.status}` });
    }

    const now = new Date();
    const hoursUntilCheckIn = (new Date(oldRaw.checkInDate) - now) / (1000 * 60 * 60);
    if (hoursUntilCheckIn < 24) {
      return res.status(400).json({ success: false, message: 'Modifications must be made at least 24 hours before check-in.' });
    }

    const newCheckIn = checkInDate ? new Date(checkInDate) : oldRaw.checkInDate;
    const newCheckOut = checkOutDate ? new Date(checkOutDate) : oldRaw.checkOutDate;
    const newGuests = guests || oldRaw.guests;
    const newRooms = roomsRequested || 1;

    if (newCheckOut <= newCheckIn) {
      return res.status(400).json({ success: false, message: 'Check-out date must be after check-in date' });
    }

    const availability = await checkAvailability(oldRaw.hotelId, newCheckIn, newCheckOut, newRooms);
    if (!availability.available) {
      const adjustedAvailable = availability.availableRooms + newRooms;
      if (adjustedAvailable < newRooms) {
        return res.status(400).json({ success: false, message: `Sorry, only ${adjustedAvailable} room(s) available.`, availableRooms: adjustedAvailable });
      }
    }

    const newPricing = await calculateDynamicPrice(oldRaw.hotelId, newCheckIn, newCheckOut);

    const modifications = {
      oldCheckIn: oldRaw.checkInDate, oldCheckOut: oldRaw.checkOutDate, oldGuests: oldRaw.guests, oldPrice: oldRaw.totalPrice,
      newCheckIn, newCheckOut, newGuests, newPrice: newPricing.totalPrice,
      priceDifference: newPricing.totalPrice - oldRaw.totalPrice, modifiedAt: new Date(),
    };

    const history = Array.isArray(oldRaw.modificationHistory) ? [...oldRaw.modificationHistory, modifications] : [modifications];

    const updated = await prisma.booking.update({
      where: { id: req.params.id },
      data: {
        checkInDate: newCheckIn, checkOutDate: newCheckOut, guests: newGuests,
        totalPrice: newPricing.totalPrice, pricePerNight: newPricing.pricePerNight,
        pricingDetails: newPricing.breakdown, modificationHistory: history,
      },
      include: bookingInclude,
    });

    const updatedBooking = formatBooking(updated);

    try {
      const content = bookingModificationEmail(updatedBooking, updated.hotel, modifications);
      await sendEmail({ to: updatedBooking.userEmail, subject: content.subject, html: content.html, text: content.text });
    } catch (e) { console.error('Failed to send modification email:', e); }

    res.status(200).json({ success: true, message: 'Booking modified successfully', data: updatedBooking, modifications });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to modify booking', error: error.message });
  }
};

export const getBookingStats = async (req, res) => {
  try {
    const [totalBookings, confirmedBookings, completedBookings, cancelledBookings, revenueResult] = await Promise.all([
      prisma.booking.count(),
      prisma.booking.count({ where: { status: 'confirmed' } }),
      prisma.booking.count({ where: { status: 'completed' } }),
      prisma.booking.count({ where: { status: 'cancelled' } }),
      prisma.booking.aggregate({
        _sum: { totalPrice: true },
        where: { status: { in: ['confirmed', 'completed'] } },
      }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalBookings,
        confirmedBookings,
        completedBookings,
        cancelledBookings,
        totalRevenue: revenueResult._sum.totalPrice || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const generateInvoice = async (req, res) => {
  try {
    const raw = await prisma.booking.findUnique({ where: { id: req.params.id }, include: bookingInclude });
    if (!raw) return res.status(404).json({ success: false, message: 'Booking not found' });

    if (req.user.role !== 'admin' && raw.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this invoice' });
    }

    if (!['confirmed', 'completed', 'payment_confirmed'].includes(raw.status)) {
      return res.status(400).json({ success: false, message: 'Invoice can only be generated for confirmed bookings' });
    }

    let booking = formatBooking(raw);
    if (!booking.invoiceNumber) {
      const updated = await prisma.booking.update({
        where: { id: req.params.id },
        data: { invoiceNumber: generateInvoiceNumber(), invoiceGeneratedAt: new Date() },
        include: bookingInclude,
      });
      booking = formatBooking(updated);
    }

    const pdfBuffer = await generateInvoicePDF(booking, raw.hotel);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Invoice-${booking.invoiceNumber}.pdf`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to generate invoice', error: error.message });
  }
};

export const sendInvoiceEmail = async (req, res) => {
  try {
    const raw = await prisma.booking.findUnique({ where: { id: req.params.id }, include: bookingInclude });
    if (!raw) return res.status(404).json({ success: false, message: 'Booking not found' });

    if (!['confirmed', 'completed', 'payment_confirmed'].includes(raw.status)) {
      return res.status(400).json({ success: false, message: 'Invoice can only be generated for confirmed bookings' });
    }

    let booking = formatBooking(raw);
    if (!booking.invoiceNumber) {
      const updated = await prisma.booking.update({
        where: { id: req.params.id },
        data: { invoiceNumber: generateInvoiceNumber(), invoiceGeneratedAt: new Date() },
        include: bookingInclude,
      });
      booking = formatBooking(updated);
    }

    const hotel = raw.hotel;
    const pdfBuffer = await generateInvoicePDF(booking, hotel);

    await sendEmail({
      to: booking.userEmail,
      subject: `Invoice ${booking.invoiceNumber} - Nonsa Travels`,
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><h2 style="color: #2563eb;">Your Invoice is Ready!</h2><p>Dear ${booking.userName},</p><p>Thank you for your booking with Nonsa Travels. Your invoice is attached to this email.</p><div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;"><h3 style="margin: 0 0 10px 0;">Booking Details:</h3><p style="margin: 5px 0;"><strong>Invoice Number:</strong> ${booking.invoiceNumber}</p><p style="margin: 5px 0;"><strong>Hotel:</strong> ${hotel.name}</p><p style="margin: 5px 0;"><strong>Check-in:</strong> ${new Date(booking.checkInDate).toLocaleDateString()}</p><p style="margin: 5px 0;"><strong>Check-out:</strong> ${new Date(booking.checkOutDate).toLocaleDateString()}</p><p style="margin: 5px 0;"><strong>Total Amount:</strong> $${booking.totalPrice.toFixed(2)}</p></div><p>If you have any questions, please contact us at support@nonsatravels.com</p><p>Best regards,<br><strong>Nonsa Travels Team</strong></p></div>`,
      text: `Dear ${booking.userName},\n\nYour invoice (${booking.invoiceNumber}) is attached.\n\nHotel: ${hotel.name}\nCheck-in: ${new Date(booking.checkInDate).toLocaleDateString()}\nCheck-out: ${new Date(booking.checkOutDate).toLocaleDateString()}\nTotal: $${booking.totalPrice.toFixed(2)}\n\nBest regards,\nNonsa Travels Team`,
      attachments: [{ filename: `Invoice-${booking.invoiceNumber}.pdf`, content: pdfBuffer }],
    });

    res.status(200).json({ success: true, message: 'Invoice sent successfully', email: booking.userEmail, invoiceNumber: booking.invoiceNumber });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to send invoice', error: error.message });
  }
};
