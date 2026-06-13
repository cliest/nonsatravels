import fetch from 'node-fetch';

const WHATSAPP_API_URL = 'https://graph.facebook.com/v18.0';
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const WHATSAPP_ADMIN_NUMBER = process.env.WHATSAPP_ADMIN_NUMBER;

// Strip phone to digits only in international format (e.g. "+260 970 462 777" → "260970462777")
const formatPhone = (phone) => {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  // If it starts with 0 and looks like a Zambian number, prepend country code
  if (digits.startsWith('0') && digits.length <= 10) return '260' + digits.slice(1);
  return digits;
};

async function sendMessage(to, message) {
  if (!WHATSAPP_PHONE_NUMBER_ID || !WHATSAPP_ACCESS_TOKEN) {
    console.error('WhatsApp API credentials missing — message not sent to', to);
    return { skipped: true };
  }

  const url = `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`;
  const payload = {
    messaging_product: 'whatsapp',
    to,
    type: 'text',
    text: { body: message },
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) console.error('WhatsApp send failed:', data);
    return data;
  } catch (error) {
    console.error('WhatsApp error:', error.message);
  }
}

// Send to admin business number (for internal notifications)
export async function sendWhatsAppMessage(message) {
  if (!WHATSAPP_ADMIN_NUMBER) return;
  return sendMessage(WHATSAPP_ADMIN_NUMBER, message);
}

// Send to a customer's WhatsApp number
export async function sendWhatsAppToCustomer(phone, message) {
  const formatted = formatPhone(phone);
  if (!formatted) return;
  return sendMessage(formatted, message);
}

// Pre-built customer message templates
export const whatsappTemplates = {
  bankDetails: (booking, hotel, bankDetails) => {
    const checkIn = new Date(booking.checkInDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    const checkOut = new Date(booking.checkOutDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    return `*Nonsa Travels - Payment Details*

Hi ${booking.userName},

Your booking has been received! Please complete your payment via bank transfer:

*Bank:* ${bankDetails.bankName}
*Account Name:* ${bankDetails.accountName}
*Account Number:* ${bankDetails.accountNumber}${bankDetails.branchCode ? `\n*Branch Code:* ${bankDetails.branchCode}` : ''}${bankDetails.swiftCode ? `\n*Swift Code:* ${bankDetails.swiftCode}` : ''}
*Reference:* ${booking.id}

*Hotel:* ${hotel.name}, ${hotel.city}
*Check-in:* ${checkIn}
*Check-out:* ${checkOut}
*Total Due:* $${booking.totalPrice.toFixed(2)}

After making the transfer, please reply with your proof of payment and we will confirm your booking.

Thank you for choosing Nonsa Travels!`;
  },

  bookingConfirmed: (booking, hotel) => {
    const checkIn = new Date(booking.checkInDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    const checkOut = new Date(booking.checkOutDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    return `*Nonsa Travels - Booking Confirmed!*

Hi ${booking.userName},

Great news — your booking is confirmed!

*Hotel:* ${hotel.name}
*Location:* ${hotel.city}
*Check-in:* ${checkIn}
*Check-out:* ${checkOut}
*Guests:* ${booking.guests}
*Total:* $${booking.totalPrice.toFixed(2)}

Your invoice has been sent to ${booking.userEmail}.

We look forward to hosting you. If you have any questions, reply to this message.

Nonsa Travels`;
  },

  paymentConfirmed: (booking, hotel) => {
    return `*Nonsa Travels - Payment Received!*

Hi ${booking.userName},

We have received your payment for your booking at *${hotel.name}*.

Your booking is now being processed and will be confirmed shortly.

*Booking Reference:* ${booking.invoiceNumber || booking.id}

Thank you for your payment!

Nonsa Travels`;
  },

  cashBooking: (booking, hotel) => {
    const checkIn = new Date(booking.checkInDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    const checkOut = new Date(booking.checkOutDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    return `*Nonsa Travels - Booking Received!*

Hi ${booking.userName},

Your booking has been received and payment will be collected at the hotel.

*Hotel:* ${hotel.name}
*Location:* ${hotel.city}
*Check-in:* ${checkIn}
*Check-out:* ${checkOut}
*Guests:* ${booking.guests}
*Total:* $${booking.totalPrice.toFixed(2)}

Please present your booking reference at check-in:
*Ref:* ${booking.id}

Your invoice has been sent to ${booking.userEmail}.

See you soon! Nonsa Travels`;
  },
};
