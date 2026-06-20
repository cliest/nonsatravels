import prisma from '../lib/prisma.js';
import { initiateMoMoCollection, initiateCardCollection, checkCollectionStatus } from '../services/lipilaService.js';

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:5000';
const CLIENT_URL = (process.env.CLIENT_URL || 'http://localhost:5173').split(',')[0].trim();
const WEBHOOK_URL = `${SERVER_URL}/api/payments/webhook`;

const buildBookingPayload = (body) => ({
  hotelId: body.hotelId,
  checkInDate: new Date(body.checkInDate),
  checkOutDate: new Date(body.checkOutDate),
  guests: body.guests,
  totalPrice: body.totalPrice,
  userName: body.userName,
  userEmail: body.userEmail,
  userPhone: body.userPhone || null,
  specialRequests: body.specialRequests || null,
  roomPreferences: body.roomPreferences || null,
  paymentStatus: 'pending',
  status: 'pending_payment',
  ...(body.userId ? { userId: body.userId } : {}),
});

export const initiateMoMo = async (req, res) => {
  const { phoneNumber, ...bookingData } = req.body;

  if (!phoneNumber) {
    return res.status(400).json({ success: false, message: 'Phone number is required for mobile money payment' });
  }

  let booking;
  try {
    booking = await prisma.booking.create({
      data: {
        ...buildBookingPayload(bookingData),
        paymentMethod: 'mobile_money',
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to create booking', error: err.message });
  }

  try {
    const lipilaRes = await initiateMoMoCollection({
      referenceId: booking.id,
      amount: booking.totalPrice,
      narration: `Hotel booking - ${bookingData.hotelName || booking.hotelId}`,
      accountNumber: phoneNumber,
      currency: 'ZMW',
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
      },
    });
  } catch (err) {
    await prisma.booking.delete({ where: { id: booking.id } }).catch(() => {});
    const msg = err.response?.data || err.message;
    return res.status(502).json({ success: false, message: 'Payment initiation failed', error: msg });
  }
};

export const initiateCard = async (req, res) => {
  const { personalInfo, ...bookingData } = req.body;

  if (!personalInfo) {
    return res.status(400).json({ success: false, message: 'Customer info is required for card payment' });
  }

  let booking;
  try {
    booking = await prisma.booking.create({
      data: {
        ...buildBookingPayload(bookingData),
        paymentMethod: 'card',
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to create booking', error: err.message });
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
        amount: booking.totalPrice,
        narration: `Hotel booking - ${bookingData.hotelName || booking.hotelId}`,
        accountNumber: booking.userEmail,
        currency: 'ZMW',
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

export const checkStatus = async (req, res) => {
  const { referenceId } = req.params;

  try {
    const booking = await prisma.booking.findUnique({ where: { id: referenceId } });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // If webhook already confirmed the payment, report success immediately
    if (booking.status === 'payment_confirmed') {
      return res.status(200).json({
        success: true,
        data: {
          status: 'Successful',
          booking: { id: booking.id, status: booking.status, paymentStatus: booking.paymentStatus },
        },
      });
    }

    // Try Lipila check-status using our referenceId (the booking ID we sent at initiation)
    let lipilaStatus = 'Pending';
    try {
      const lipilaData = await checkCollectionStatus(referenceId);
      lipilaStatus = lipilaData?.status || 'Pending';
      console.log(`[checkStatus] ref=${referenceId} lipilaStatus=${lipilaStatus}`);
    } catch (lipilaErr) {
      // Lipila check failed — keep polling; webhook will confirm when payment completes
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
  const { referenceId, status, identifier, paymentType, amount } = req.body;

  res.status(200).json({ received: true });

  if (!referenceId) return;

  try {
    const booking = await prisma.booking.findUnique({ where: { id: referenceId } });
    if (!booking) return;

    const isSuccess = status === 'Successful';
    const isFailed = status === 'Failed';

    if (!isSuccess && !isFailed) return;

    await prisma.booking.update({
      where: { id: referenceId },
      data: {
        paymentStatus: isSuccess ? 'completed' : 'failed',
        status: isSuccess ? 'payment_confirmed' : 'cancelled',
        ...(isSuccess ? { paymentConfirmedAt: new Date() } : {}),
      },
    });
  } catch {
    // Webhook processing errors are silent — booking status stays as-is
  }
};
