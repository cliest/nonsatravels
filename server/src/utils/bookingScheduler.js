import prisma from '../lib/prisma.js';
import { sendEmail } from './emailService.js';
import { bookingReminderEmail } from './enhancedEmailTemplates.js';

export const sendCheckInReminders = async () => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const tomorrowEnd = new Date(tomorrow);
    tomorrowEnd.setHours(23, 59, 59, 999);

    const bookings = await prisma.booking.findMany({
      where: {
        checkInDate: { gte: tomorrow, lte: tomorrowEnd },
        status: { in: ['confirmed', 'payment_confirmed'] },
      },
      include: { hotel: true },
    });

    for (const booking of bookings) {
      try {
        const hotel = booking.hotel;
        if (!hotel) { console.error(`Hotel not found for booking ${booking.id}`); continue; }

        const emailContent = bookingReminderEmail({ ...booking, _id: booking.id, hotelId: hotel }, hotel);
        await sendEmail({ to: booking.userEmail, subject: emailContent.subject, html: emailContent.html, text: emailContent.text });
      } catch (emailError) {
        console.error(`Failed to send reminder for booking ${booking.id}:`, emailError.message);
      }
    }
  } catch (error) {
    console.error('Error in check-in reminder scheduler:', error);
  }
};

export const startBookingScheduler = () => {
  const now = new Date();
  const next9AM = new Date();
  next9AM.setHours(9, 0, 0, 0);

  if (now > next9AM) next9AM.setDate(next9AM.getDate() + 1);

  const msUntil9AM = next9AM - now;

  setTimeout(() => {
    sendCheckInReminders();
    setInterval(sendCheckInReminders, 24 * 60 * 60 * 1000);
  }, msUntil9AM);
};

export default { sendCheckInReminders, startBookingScheduler };
