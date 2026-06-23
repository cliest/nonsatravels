import prisma from '../lib/prisma.js';
import { initiateMoMoCollection, initiateCardCollection, checkCollectionStatus } from '../services/lipilaService.js';
import { sendEmail } from '../utils/emailService.js';
import { paymentConfirmedEmail, adminNewBookingNotification } from '../utils/enhancedEmailTemplates.js';
import { sendWhatsAppMessage, sendWhatsAppToCustomer, whatsappTemplates } from '../utils/whatsappService.js';
import { generateInvoiceNumber, generateInvoicePDF } from '../utils/invoiceGenerator.js';
import { checkAvailability, reserveRooms } from '../utils/availabilityManager.js';
import { calculateDynamicPrice } from '../utils/dynamicPricing.js';

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:5000';

// Live USD→ZMW rate with $1 markup, cached for 1 hour
let cachedZMWRate = { rate: 27, fetchedAt: 0 };
const getUSDtoZMW = async () => {
  const ONE_HOUR = 3600000;
  if (Date.now() - cachedZMWRate.fetchedAt < ONE_HOUR) return cachedZMWRate.rate;
  try {
    const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const data = await res.json();
    const liveRate = data.rates?.ZMW || 27;
    cachedZMWRate = { rate: liveRate + 1, fetchedAt: Date.now() };
    console.log(`[FX] Live USD→ZMW rate: ${liveRate}, with markup: ${liveRate + 1}`);
    return cachedZMWRate.rate;
  } catch {
    console.warn('[FX] Failed to fetch live rate, using cached:', cachedZMWRate.rate);
    return cachedZMWRate.rate;
  }
};
const CLIENT_URL = (process.env.CLIENT_URL || 'http://localhost:5173').split(',')[0].trim();
const WEBHOOK_URL = `${SERVER_URL}/api/payments/webhook`;

// Validate a promo code and calculate the discount to apply
const validateAndApplyPromo = async (promoCode, userId, amount, hotelId) => {
  if (!promoCode) return { discount: 0, promo: null };

  const promo = await prisma.promoCode.findFirst({
    where: { code: promoCode.toUpperCase(), isActive: true },
    include: { usedBy: true },
  });
  if (!promo) return { discount: 0, promo: null };

  const now = new Date();
  if (now < promo.validFrom || now > promo.validUntil) return { discount: 0, promo: null };
  if (promo.usageLimit !== null && promo.usageCount >= promo.usageLimit) return { discount: 0, promo: null };
  if (userId) {
    const used = promo.usedBy.filter((u) => u.userId === userId).length;
    if (used >= promo.usagePerUser) return { discount: 0, promo: null };
  }
  if (amount < promo.minBookingAmount) return { discount: 0, promo: null };
  if (promo.applicableHotels.length > 0 && hotelId && !promo.applicableHotels.includes(hotelId)) return { discount: 0, promo: null };

  let discount = promo.discountType === 'percentage'
    ? (amount * promo.discountValue) / 100
    : promo.discountValue;
  if (promo.maxDiscount !== null && discount > promo.maxDiscount) discount = promo.maxDiscount;
  if (discount > amount) discount = amount;
  return { discount: Math.round(discount * 100) / 100, promo };
};

// Record promo usage after a successful booking
const recordPromoUsage = async (promoId, userId, bookingId) => {
  if (!promoId) return;
  try {
    await prisma.promoCode.update({
      where: { id: promoId },
      data: {
        usageCount: { increment: 1 },
        usedBy: { create: { userId: userId || 'guest', bookingId, usedAt: new Date() } },
      },
    });
  } catch (e) {
    console.error('[recordPromoUsage] error:', e.message);
  }
};

// Shared setup: validate hotel, check availability, calculate server-side price, reserve, create booking
const createLipilaBooking = async (body, paymentMethod) => {
  const { hotelId, checkInDate, checkOutDate, guests, userId, promoCode, roomTypeId, roomTypeName, additionalServices } = body;

  const hotel = await prisma.hotel.findUnique({ where: { id: hotelId } });
  if (!hotel) throw Object.assign(new Error('Hotel not found'), { statusCode: 404 });

  const availability = await checkAvailability(hotelId, checkInDate, checkOutDate, 1);
  if (!availability.available) {
    throw Object.assign(new Error('Sorry, no rooms available for the selected dates.'), { statusCode: 400 });
  }

  const pricing = await calculateDynamicPrice(hotelId, checkInDate, checkOutDate, roomTypeId || null);
  const servicesCost = Array.isArray(additionalServices) ? additionalServices.reduce((sum, s) => sum + (s.cost || 0), 0) : 0;
  let finalPrice = (pricing.totalPrice || body.totalPrice) + servicesCost;

  if (!finalPrice || finalPrice <= 0) {
    throw Object.assign(new Error('Unable to calculate booking price.'), { statusCode: 400 });
  }

  const { discount, promo } = await validateAndApplyPromo(promoCode, userId, finalPrice, hotelId);
  if (discount > 0) finalPrice = Math.max(0, finalPrice - discount);

  await reserveRooms(hotelId, checkInDate, checkOutDate, 1);

  const booking = await prisma.booking.create({
    data: {
      hotelId,
      checkInDate: new Date(checkInDate),
      checkOutDate: new Date(checkOutDate),
      guests: guests || 1,
      totalPrice: finalPrice,
      pricePerNight: pricing.pricePerNight,
      pricingDetails: pricing.breakdown,
      userName: body.userName,
      userEmail: body.userEmail,
      userPhone: body.userPhone || null,
      specialRequests: body.specialRequests || null,
      roomPreferences: body.roomPreferences || null,
      paymentMethod,
      paymentStatus: 'pending',
      status: 'pending_payment',
      ...(promoCode && discount > 0 ? { promoCode: promoCode.toUpperCase(), promoDiscount: discount } : {}),
      ...(userId ? { userId } : {}),
      ...(roomTypeId ? { roomTypeId, roomTypeName: roomTypeName || null } : {}),
      ...(additionalServices?.length ? { additionalServices } : {}),
    },
    include: { hotel: true },
  });

  return { booking, hotel, finalPrice, appliedPromo: promo };
};

export const initiateMoMo = async (req, res) => {
  const { phoneNumber, bookingId, ...bookingData } = req.body;

  if (!phoneNumber) {
    return res.status(400).json({ success: false, message: 'Phone number is required for mobile money payment' });
  }

  let booking, hotel, finalPrice, appliedPromo;

  // If booking already exists (two-step flow), use it
  if (bookingId) {
    try {
      const existing = await prisma.booking.findUnique({ where: { id: bookingId }, include: { hotel: true } });
      if (!existing) return res.status(404).json({ success: false, message: 'Booking not found' });
      booking = existing;
      hotel = existing.hotel;
      finalPrice = existing.totalPrice;
      await prisma.booking.update({ where: { id: bookingId }, data: { paymentMethod: 'mobile_money' } });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  } else {
    try {
      ({ booking, hotel, finalPrice, appliedPromo } = await createLipilaBooking(bookingData, 'mobile_money'));
    } catch (err) {
      return res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
  }

  try {
    // MoMo in Zambia processes in ZMW — convert using live rate + $1 markup
    const USD_TO_ZMW = await getUSDtoZMW();
    const momoAmount = Math.round(finalPrice * USD_TO_ZMW * 100) / 100;

    const lipilaRes = await initiateMoMoCollection({
      referenceId: booking.id,
      amount: momoAmount,
      narration: `Hotel booking - ${hotel.name} ($${finalPrice} USD)`,
      accountNumber: phoneNumber,
      currency: 'USD',
      email: booking.userEmail,
      callbackUrl: WEBHOOK_URL,
    });

    console.log(`[initiateMoMo] bookingId=${booking.id} phone=${phoneNumber} lipilaResponse=`, JSON.stringify(lipilaRes));

    await prisma.booking.update({
      where: { id: booking.id },
      data: { paymentId: lipilaRes.identifier },
    });

    return res.status(200).json({
      success: true,
      data: {
        bookingId: booking.id,
        referenceId: booking.id,
        identifier: lipilaRes.identifier,
        status: lipilaRes.status,
        promoApplied: appliedPromo ? { code: appliedPromo.code, discount: booking.promoDiscount } : null,
      },
    });
  } catch (err) {
    if (!bookingId) await prisma.booking.delete({ where: { id: booking.id } }).catch(() => {});
    const msg = err.response?.data || err.message;
    return res.status(502).json({ success: false, message: 'Payment initiation failed', error: msg });
  }
};

export const initiateCard = async (req, res) => {
  const { personalInfo, bookingId, ...bookingData } = req.body;

  if (!personalInfo) {
    return res.status(400).json({ success: false, message: 'Customer info is required for card payment' });
  }

  let booking, hotel, finalPrice, appliedPromo;

  if (bookingId) {
    try {
      const existing = await prisma.booking.findUnique({ where: { id: bookingId }, include: { hotel: true } });
      if (!existing) return res.status(404).json({ success: false, message: 'Booking not found' });
      booking = existing;
      hotel = existing.hotel;
      finalPrice = existing.totalPrice;
      await prisma.booking.update({ where: { id: bookingId }, data: { paymentMethod: 'card' } });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  } else {
    try {
      ({ booking, hotel, finalPrice, appliedPromo } = await createLipilaBooking(bookingData, 'card'));
    } catch (err) {
      return res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
  }

  try {
    const lipilaRes = await initiateCardCollection({
      customerInfo: {
        firstName: personalInfo.firstName,
        lastName: personalInfo.lastName,
        phoneNumber: personalInfo.phone || personalInfo.phoneNumber,
        city: personalInfo.city || 'Lusaka',
        country: 'ZM',
        address: personalInfo.address || 'N/A',
        zip: personalInfo.zip || '10101',
        email: booking.userEmail,
      },
      collectionRequest: {
        referenceId: booking.id,
        amount: finalPrice,
        narration: `Hotel booking - ${hotel.name}`,
        accountNumber: booking.userEmail,
        currency: 'USD',
        backUrl: `${CLIENT_URL}/payment-callback?status=failed&referenceId=${booking.id}`,
        redirectUrl: `${CLIENT_URL}/payment-callback?status=success&referenceId=${booking.id}`,
      },
      callbackUrl: WEBHOOK_URL,
    });

    await prisma.booking.update({
      where: { id: booking.id },
      data: { paymentId: lipilaRes.identifier },
    });

    return res.status(200).json({
      success: true,
      data: {
        bookingId: booking.id,
        referenceId: booking.id,
        identifier: lipilaRes.identifier,
        checkoutUrl: lipilaRes.cardRedirectionUrl,
        status: lipilaRes.status,
      },
    });
  } catch (err) {
    await prisma.booking.delete({ where: { id: booking.id } }).catch(() => {});
    const msg = err.response?.data || err.message;
    return res.status(502).json({ success: false, message: 'Card payment initiation failed', error: msg });
  }
};

export const getExchangeRate = async (req, res) => {
  const rate = await getUSDtoZMW();
  res.status(200).json({ success: true, data: { USD_TO_ZMW: rate } });
};

export const checkStatus = async (req, res) => {
  const { referenceId } = req.params;

  try {
    const booking = await prisma.booking.findUnique({ where: { id: referenceId } });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Webhook already confirmed — no need to poll Lipila
    if (booking.status === 'payment_confirmed') {
      return res.status(200).json({
        success: true,
        data: {
          status: 'Successful',
          booking: { id: booking.id, status: booking.status, paymentStatus: booking.paymentStatus },
        },
      });
    }

    // Booking was cancelled (payment failed via webhook)
    if (booking.status === 'cancelled' && booking.paymentStatus === 'failed') {
      return res.status(200).json({
        success: true,
        data: {
          status: 'Failed',
          booking: { id: booking.id, status: booking.status, paymentStatus: booking.paymentStatus },
        },
      });
    }

    // Try Lipila status check
    let lipilaStatus = 'Pending';
    try {
      const lipilaData = await checkCollectionStatus(referenceId);
      lipilaStatus = lipilaData?.status || 'Pending';
      console.log(`[checkStatus] ref=${referenceId} lipilaStatus=${lipilaStatus}`);
    } catch (lipilaErr) {
      console.log(`[checkStatus] Lipila unreachable (${lipilaErr.message}), relying on webhook`);
    }

    return res.status(200).json({
      success: true,
      data: {
        status: lipilaStatus,
        booking: { id: booking.id, status: booking.status, paymentStatus: booking.paymentStatus },
      },
    });
  } catch (err) {
    console.error('[checkStatus] error:', err.message);
    return res.status(502).json({ success: false, message: 'Failed to check payment status' });
  }
};

export const handleWebhook = async (req, res) => {
  const { referenceId, status } = req.body;

  // Acknowledge immediately so Lipila doesn't retry
  res.status(200).json({ received: true });

  if (!referenceId) return;

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: referenceId },
      include: { hotel: true },
    });
    if (!booking) return;

    // Idempotency: skip if already in a final state
    if (booking.status === 'payment_confirmed' || booking.status === 'cancelled') return;

    const isSuccess = status === 'Successful';
    const isFailed = status === 'Failed';
    if (!isSuccess && !isFailed) return;

    const updated = await prisma.booking.update({
      where: { id: referenceId },
      data: {
        paymentStatus: isSuccess ? 'completed' : 'failed',
        status: isSuccess ? 'payment_confirmed' : 'cancelled',
        ...(isSuccess ? { paymentConfirmedAt: new Date() } : {}),
      },
      include: { hotel: true },
    });

    if (!isSuccess) return;

    // Record promo code usage if applicable
    if (booking.promoCode) {
      const promo = await prisma.promoCode.findFirst({ where: { code: booking.promoCode } });
      if (promo) await recordPromoUsage(promo.id, booking.userId, referenceId);
    }

    // Generate invoice and send confirmation email
    const hotel = updated.hotel;
    let populatedBooking = { ...updated, _id: updated.id, hotelId: hotel };

    let invoicePDF = null;
    try {
      if (!updated.invoiceNumber) {
        const invoiceNumber = generateInvoiceNumber();
        const withInvoice = await prisma.booking.update({
          where: { id: referenceId },
          data: { invoiceNumber, invoiceGeneratedAt: new Date() },
          include: { hotel: true },
        });
        populatedBooking = { ...withInvoice, _id: withInvoice.id, hotelId: hotel };
      }
      invoicePDF = await generateInvoicePDF(populatedBooking, hotel);
    } catch (e) {
      console.error('[webhook] Invoice error:', e.message);
    }

    const attachments = invoicePDF
      ? [{ filename: `Receipt-${populatedBooking.invoiceNumber || referenceId}.pdf`, content: invoicePDF }]
      : [];

    try {
      const emailContent = paymentConfirmedEmail(populatedBooking, hotel);
      await sendEmail({ to: updated.userEmail, subject: `Payment Receipt - ${hotel.name} | Nonsa Travels`, html: emailContent.html, text: emailContent.text, attachments });
      if (updated.userPhone) {
        await sendWhatsAppToCustomer(updated.userPhone, whatsappTemplates.paymentConfirmed(populatedBooking, hotel));
      }
    } catch (e) {
      console.error('[webhook] Email error:', e.message);
    }

    try {
      const adminEmail = adminNewBookingNotification(populatedBooking, hotel);
      await sendEmail({ to: process.env.ADMIN_EMAIL || 'admin@nonsatravels.com', subject: adminEmail.subject, html: adminEmail.html, text: adminEmail.text });
      await sendWhatsAppMessage(`Payment confirmed:\nHotel: ${hotel.name}\nGuest: ${updated.userName}\nAmount: $${updated.totalPrice}\nMethod: ${updated.paymentMethod}`);
    } catch (e) {
      console.error('[webhook] Admin notification error:', e.message);
    }
  } catch (err) {
    console.error('[webhook] Error:', err.message);
  }
};
