// Enhanced email templates for booking notifications

import { emailHeader, emailFooter, emailStyles } from './emailTemplates.js';

// Enhanced booking confirmation with dynamic pricing details
export const enhancedBookingConfirmationEmail = (booking, hotel, pricingDetails) => {
  const checkIn = new Date(booking.checkInDate);
  const checkOut = new Date(booking.checkOutDate);
  const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  
  // Handle both fresh pricing object and stored breakdown
  const breakdown = pricingDetails?.breakdown || pricingDetails; // pricingDetails might BE the breakdown
  const basePrice = pricingDetails?.basePrice || breakdown?.basePrice || booking.pricePerNight;
  const finalPricePerNight = pricingDetails?.pricePerNight || booking.pricePerNight;
  
  const priceBreakdownHTML = breakdown ? `
    <div class="pricing-breakdown">
      <h3>Price Breakdown</h3>
      <div class="detail-row">
        <span class="detail-label">Base Price per Night:</span>
        <span>$${basePrice.toFixed(2)}</span>
      </div>
      ${breakdown.peakSeasonApplied ? `
        <div class="detail-row">
          <span class="detail-label">Peak Season (${((breakdown.peakSeasonMultiplier - 1) * 100).toFixed(0)}%):</span>
          <span style="color: #f59e0b;">+$${((basePrice * (breakdown.peakSeasonMultiplier - 1) * nights)).toFixed(2)}</span>
        </div>
      ` : ''}
      ${breakdown.highDemandApplied ? `
        <div class="detail-row">
          <span class="detail-label">High Demand (${((breakdown.highDemandMultiplier - 1) * 100).toFixed(0)}%):</span>
          <span style="color: #f59e0b;">+$${((finalPricePerNight * (breakdown.highDemandMultiplier - 1) * nights)).toFixed(2)}</span>
        </div>
      ` : ''}
      ${breakdown.lowOccupancyApplied ? `
        <div class="detail-row">
          <span class="detail-label">Low Occupancy Discount (${((1 - breakdown.lowOccupancyDiscount) * 100).toFixed(0)}%):</span>
          <span style="color: #10b981;">-$${((basePrice * (1 - breakdown.lowOccupancyDiscount) * nights)).toFixed(2)}</span>
        </div>
      ` : ''}
      ${breakdown.earlyBirdApplied ? `
        <div class="detail-row">
          <span class="detail-label">Early Bird Discount (5%):</span>
          <span style="color: #10b981;">-$${((basePrice * 0.05 * nights)).toFixed(2)}</span>
        </div>
      ` : ''}
      ${breakdown.weekendApplied ? `
        <div class="detail-row">
          <span class="detail-label">Weekend Premium (15%):</span>
          <span style="color: #f59e0b;">+$${((finalPricePerNight * 0.15 * nights)).toFixed(2)}</span>
        </div>
      ` : ''}
      <div class="detail-row" style="border-top: 2px solid #667eea; margin-top: 10px; padding-top: 10px; font-weight: bold;">
        <span class="detail-label">Final Price per Night:</span>
        <span>$${finalPricePerNight.toFixed(2)}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">${nights} Night(s):</span>
        <span>$${(finalPricePerNight * nights).toFixed(2)}</span>
      </div>
    </div>
  ` : '';

  return {
    subject: `Booking Confirmed - ${hotel?.name || 'Your Stay'}`,  
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            ${emailStyles}
            .pricing-breakdown { background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .pricing-breakdown h3 { margin-top: 0; color: #0369a1; }
          </style>
        </head>
        <body>
          <div class="container">
            ${emailHeader('Booking Confirmed!', 'Your reservation is confirmed', '#10b981 0%, #059669 100%')}
            <div class="content">
              <p>Dear ${booking.userName},</p>
              <p>Great news! Your booking has been confirmed and we're excited to welcome you!</p>
              
              <div class="booking-details">
                <h2>Booking Details</h2>
                <div class="detail-row">
                  <span class="detail-label">Booking ID:</span>
                  <span>${booking._id}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Hotel:</span>
                  <span>${hotel?.name || 'N/A'}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Location:</span>
                  <span>${hotel?.address || 'N/A'}, ${hotel?.city || ''}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Check-in:</span>
                  <span>${checkIn.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Check-out:</span>
                  <span>${checkOut.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Duration:</span>
                  <span>${nights} Night(s)</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Rooms:</span>
                  <span>${booking.guests} Room(s)</span>
                </div>
              </div>

              ${priceBreakdownHTML}

              <div class="detail-row" style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <span class="detail-label" style="font-size: 18px;">Total Amount:</span>
                <span class="total">$${booking.totalPrice}</span>
              </div>

              <div class="info-box">
                <h3 style="margin-top: 0;">Important Information</h3>
                <ul>
                  <li><strong>Check-in time:</strong> 2:00 PM onwards</li>
                  <li><strong>Check-out time:</strong> 11:00 AM</li>
                  <li><strong>Required:</strong> Valid ID/Passport at check-in</li>
                  <li><strong>Contact Hotel:</strong> ${hotel?.contact || '+260 211 234 567'}</li>
                  <li><strong>Parking:</strong> Free parking available (subject to availability)</li>
                </ul>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <p><strong>Need to make changes?</strong></p>
                <p style="font-size: 14px; color: #6b7280;">Contact us at support@nonsatravels.com</p>
              </div>
              
              <p style="margin-top: 30px;">We look forward to hosting you!</p>
              <p style="margin-top: 20px;">Warm regards,<br><strong>The Nonsa Travels Team</strong></p>
            </div>
            ${emailFooter()}
          </div>
        </body>
      </html>
    `,
    text: `
Booking Confirmed - ${hotel?.name || 'Your Stay'}

Dear ${booking.userName},

Your booking has been confirmed!

Booking Details:
- Booking ID: ${booking._id}
- Hotel: ${hotel?.name || 'N/A'}
- Location: ${hotel?.address || 'N/A'}, ${hotel?.city || ''}
- Check-in: ${checkIn.toDateString()}
- Check-out: ${checkOut.toDateString()}
- Duration: ${nights} Night(s)
- Rooms: ${booking.guests}

${pricingDetails ? `
Price Breakdown:
- Base Price: $${pricingDetails.basePrice?.toFixed(2)}
- Final Price per Night: $${pricingDetails.pricePerNight?.toFixed(2)}
- ${nights} Night(s): $${(pricingDetails.pricePerNight * nights).toFixed(2)}
` : ''}

Total Amount: $${booking.totalPrice}

Important Information:
- Check-in time: 2:00 PM onwards
- Check-out time: 11:00 AM
- Required: Valid ID/Passport
- Contact Hotel: ${hotel?.contact || '+260 211 234 567'}

We look forward to hosting you!

Best regards,
The Nonsa Travels Team
    `,
  };
};

// Booking reminder email (24 hours before check-in)
export const bookingReminderEmail = (booking, hotel) => {
  const checkIn = new Date(booking.checkInDate);
  
  return {
    subject: `Reminder: Your Check-in Tomorrow at ${hotel?.name || 'Hotel'}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>${emailStyles}</style>
        </head>
        <body>
          <div class="container">
            ${emailHeader('Check-in Reminder', 'Your stay begins tomorrow!', '#f59e0b 0%, #d97706 100%')}
            <div class="content">
              <p>Dear ${booking.userName},</p>
              <p>This is a friendly reminder that your check-in is <strong>tomorrow</strong>!</p>
              
              <div class="booking-details">
                <h2>Reservation Details</h2>
                <div class="detail-row">
                  <span class="detail-label">Hotel:</span>
                  <span>${hotel?.name || 'N/A'}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Address:</span>
                  <span>${hotel?.address || 'N/A'}, ${hotel?.city || ''}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Check-in Date:</span>
                  <span>${checkIn.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Check-in Time:</span>
                  <span>2:00 PM onwards</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Booking ID:</span>
                  <span>${booking._id}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Hotel Contact:</span>
                  <span>${hotel?.contact || '+260 211 234 567'}</span>
                </div>
              </div>

              <div class="info-box">
                <h3 style="margin-top: 0;">Checklist Before You Arrive</h3>
                <ul style="list-style: disc; padding-left: 20px;">
                  <li>Valid ID or Passport</li>
                  <li>Booking confirmation (this email)</li>
                  <li>Payment confirmation</li>
                  <li>Special requests communicated to hotel</li>
                </ul>
              </div>

              <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; color: #92400e;"><strong>Travel Tip:</strong> Arrive after 2:00 PM to ensure your room is ready. Early check-in may be available upon request (subject to availability).</p>
              </div>
              
              <p><strong>Questions or Need Assistance?</strong></p>
              <p>Contact the hotel directly at ${hotel?.contact || '+260 211 234 567'} or reach us at support@nonsatravels.com</p>
              
              <p style="margin-top: 30px;">Have a wonderful stay!</p>
              <p style="margin-top: 20px;">Safe travels,<br><strong>The Nonsa Travels Team</strong></p>
            </div>
            ${emailFooter()}
          </div>
        </body>
      </html>
    `,
    text: `
Check-in Reminder - Tomorrow!

Dear ${booking.userName},

Your check-in is tomorrow at ${hotel?.name || 'Hotel'}!

Details:
- Hotel: ${hotel?.name || 'N/A'}
- Address: ${hotel?.address || 'N/A'}, ${hotel?.city || ''}
- Check-in Date: ${checkIn.toDateString()}
- Check-in Time: 2:00 PM onwards
- Booking ID: ${booking._id}
- Hotel Contact: ${hotel?.contact || '+260 211 234 567'}

Remember to bring:
- Valid ID or Passport
- Booking confirmation
- Payment confirmation

Have a wonderful stay!

Best regards,
The Nonsa Travels Team
    `,
  };
};

// Booking cancellation confirmation
export const bookingCancellationEmail = (booking, hotel, refundAmount, reason) => {
  return {
    subject: `Booking Cancelled - ${booking._id}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>${emailStyles}</style>
        </head>
        <body>
          <div class="container">
            ${emailHeader('Booking Cancelled', 'Your reservation has been cancelled', '#ef4444 0%, #dc2626 100%')}
            <div class="content">
              <p>Dear ${booking.userName},</p>
              <p>This email confirms that your booking has been cancelled.</p>
              
              <div class="booking-details">
                <h2>Cancelled Booking Details</h2>
                <div class="detail-row">
                  <span class="detail-label">Booking ID:</span>
                  <span>${booking._id}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Hotel:</span>
                  <span>${hotel?.name || 'N/A'}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Check-in Date:</span>
                  <span>${new Date(booking.checkInDate).toLocaleDateString()}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Check-out Date:</span>
                  <span>${new Date(booking.checkOutDate).toLocaleDateString()}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Original Amount:</span>
                  <span>$${booking.totalPrice}</span>
                </div>
                ${refundAmount !== undefined ? `
                  <div class="detail-row" style="border-top: 2px solid #667eea; margin-top: 10px; padding-top: 10px;">
                    <span class="detail-label">Refund Amount:</span>
                    <span class="total" style="color: #10b981;">$${refundAmount.toFixed(2)}</span>
                  </div>
                ` : ''}
                ${reason ? `
                  <div class="detail-row">
                    <span class="detail-label">Cancellation Reason:</span>
                    <span>${reason}</span>
                  </div>
                ` : ''}
              </div>

              ${refundAmount !== undefined && refundAmount > 0 ? `
                <div class="info-box">
                  <h3 style="margin-top: 0;">Refund Information</h3>
                  <p>A refund of <strong>$${refundAmount.toFixed(2)}</strong> will be processed to your original payment method within 5-10 business days.</p>
                  <p style="font-size: 13px; color: #6b7280; margin-top: 10px;">Note: Actual refund time may vary depending on your bank or payment provider.</p>
                </div>
              ` : ''}

              <p style="margin-top: 20px;">We're sorry to see you cancel. If you have any questions or concerns, please don't hesitate to contact us.</p>
              
              <div style="text-align: center; margin: 30px 0; padding: 20px; background: #f9fafb; border-radius: 8px;">
                <p style="margin: 0 0 15px 0;">Looking to book again?</p>
                <a href="https://nonsatravels.com/hotels" class="btn">Browse Hotels</a>
              </div>
              
              <p style="margin-top: 30px;">We hope to serve you again in the future!</p>
              <p style="margin-top: 20px;">Best regards,<br><strong>The Nonsa Travels Team</strong></p>
            </div>
            ${emailFooter()}
          </div>
        </body>
      </html>
    `,
    text: `
Booking Cancelled

Dear ${booking.userName},

Your booking has been cancelled.

Cancelled Booking Details:
- Booking ID: ${booking._id}
- Hotel: ${hotel?.name || 'N/A'}
- Check-in Date: ${new Date(booking.checkInDate).toDateString()}
- Check-out Date: ${new Date(booking.checkOutDate).toDateString()}
- Original Amount: $${booking.totalPrice}
${refundAmount !== undefined ? `- Refund Amount: $${refundAmount.toFixed(2)}` : ''}
${reason ? `- Reason: ${reason}` : ''}

${refundAmount !== undefined && refundAmount > 0 ? `
Refund of $${refundAmount.toFixed(2)} will be processed within 5-10 business days.
` : ''}

If you have any questions, please contact us.

Best regards,
The Nonsa Travels Team
    `,
  };
};

// Admin notification for new booking
export const adminNewBookingNotification = (booking, hotel) => {
  const checkIn = new Date(booking.checkInDate);
  const checkOut = new Date(booking.checkOutDate);
  const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  
  return {
    subject: `New Booking Received - ${hotel?.name || 'Hotel'}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>${emailStyles}</style>
        </head>
        <body>
          <div class="container">
            ${emailHeader('New Booking Alert', 'Action required: Review and confirm', '#8b5cf6 0%, #7c3aed 100%')}
            <div class="content">
              <p><strong>Admin Dashboard Alert</strong></p>
              <p>A new booking has been received and requires your review.</p>
              
              <div class="booking-details">
                <h2>Booking Information</h2>
                <div class="detail-row">
                  <span class="detail-label">Booking ID:</span>
                  <span>${booking._id}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Guest Name:</span>
                  <span>${booking.userName}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Guest Email:</span>
                  <span>${booking.userEmail}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Hotel:</span>
                  <span>${hotel?.name || 'N/A'}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Check-in:</span>
                  <span>${checkIn.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Check-out:</span>
                  <span>${checkOut.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Duration:</span>
                  <span>${nights} Night(s)</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Rooms:</span>
                  <span>${booking.guests}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Payment Method:</span>
                  <span>${booking.paymentMethod?.toUpperCase() || 'N/A'}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Payment ID:</span>
                  <span>${booking.paymentId || 'N/A'}</span>
                </div>
                <div class="detail-row" style="border-top: 2px solid #667eea; margin-top: 10px; padding-top: 10px; font-weight: bold;">
                  <span class="detail-label">Total Amount:</span>
                  <span class="total">$${booking.totalPrice}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Status:</span>
                  <span class="status-badge">${booking.status}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Booking Date:</span>
                  <span>${new Date(booking.createdAt || Date.now()).toLocaleString()}</span>
                </div>
              </div>

              <div class="info-box" style="background: #fee2e2; border-color: #ef4444;">
                <h3 style="margin-top: 0; color: #991b1b;">URGENT: Payment Verification Required</h3>
                <ul style="margin: 10px 0;">
                  <li><strong style="color: #dc2626;">1. VERIFY PAYMENT RECEIPT FIRST</strong> - Check that $${booking.totalPrice} was actually received</li>
                  <li><strong>2. Check room availability</strong> for the selected dates</li>
                  <li><strong>3. Confirm booking</strong> in dashboard (this will send customer confirmation email)</li>
                  <li><strong>4. If payment not received:</strong> Reject booking and contact customer</li>
                </ul>
                <p style="margin: 15px 0 0 0; padding: 12px; background: #fff7ed; border-radius: 5px; font-size: 13px; color: #9a3412;">
                  <strong>Important:</strong> Customer will NOT receive confirmation email until you verify payment and confirm the booking in the dashboard.
                </p>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin" class="btn" style="background: #dc2626;">Verify Payment & Confirm Booking</a>
              </div>
              
              <p style="margin-top: 30px; font-size: 13px; color: #6b7280;">This is an automated notification. Customer is waiting for your verification to receive confirmation email.</p>
            </div>
            ${emailFooter()}
          </div>
        </body>
      </html>
    `,
    text: `
New Booking Received - Action Required

A new booking requires your review:

Booking Details:
- Booking ID: ${booking._id}
- Guest: ${booking.userName} (${booking.userEmail})
- Hotel: ${hotel?.name || 'N/A'}
- Check-in: ${checkIn.toDateString()}
- Check-out: ${checkOut.toDateString()}
- Duration: ${nights} Night(s)
- Rooms: ${booking.guests}
- Payment Method: ${booking.paymentMethod?.toUpperCase() || 'N/A'}
- Payment ID: ${booking.paymentId || 'N/A'}
- Total Amount: $${booking.totalPrice}
- Status: ${booking.status}

Action Required:
1. VERIFY PAYMENT RECEIPT FIRST - Check that $${booking.totalPrice} was actually received
2. Check room availability for the selected dates
3. Confirm booking in dashboard (this will send customer confirmation email)
4. If payment not received: Reject booking and contact customer

Important: Customer will NOT receive confirmation email until you verify payment and confirm the booking in the dashboard.

View in admin dashboard: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin

Customer is waiting for your verification to receive confirmation email.

Best regards,
Nonsa Travels System
    `,
  };
};

// Payment Confirmed Email - sent when admin confirms receipt of payment
export const paymentConfirmedEmail = (booking, hotel) => {
  const checkIn = new Date(booking.checkInDate);
  const checkOut = new Date(booking.checkOutDate);
  const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

  return {
    subject: `Payment Confirmed - ${hotel?.name || 'Your Booking'}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>${emailStyles}</style>
        </head>
        <body>
          <div class="container">
            ${emailHeader('Payment Confirmed!', 'We have received your payment', '#10b981 0%, #059669 100%')}
            <div class="content">
              <p>Dear ${booking.userName},</p>
              <p>Great news! <strong>We have successfully received and verified your payment</strong> for your upcoming stay at ${hotel?.name || 'our hotel'}.</p>
              
              <div style="background: #d1fae5; padding: 20px; border-radius: 12px; margin: 20px 0; border-left: 4px solid #10b981;">
                <h3 style="margin: 0 0 10px 0; color: #047857;">Payment Status: CONFIRMED</h3>
                <p style="margin: 0; color: #065f46;">Amount Received: <strong>$${booking.totalPrice.toFixed(2)}</strong></p>
                <p style="margin: 5px 0 0 0; font-size: 13px; color: #047857;">Payment Method: ${booking.paymentMethod === 'bank_transfer' ? 'Bank Transfer' : booking.paymentMethod === 'cash' ? 'Cash Payment' : booking.paymentMethod?.toUpperCase()}</p>
              </div>
              
              <div class="booking-details">
                <h2>Booking Summary</h2>
                <div class="detail-row">
                  <span class="detail-label">Booking ID:</span>
                  <span style="font-family: monospace; font-size: 12px;">${booking._id}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Hotel:</span>
                  <span>${hotel?.name || 'N/A'}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Check-in:</span>
                  <span>${checkIn.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Check-out:</span>
                  <span>${checkOut.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Duration:</span>
                  <span>${nights} Night(s)</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Guests:</span>
                  <span>${booking.guests}</span>
                </div>
                <div class="detail-row" style="background: #f0fdf4; padding: 15px; margin-top: 10px; border-radius: 8px;">
                  <span class="detail-label" style="color: #047857;">Total Paid:</span>
                  <span class="total" style="color: #047857;">$${booking.totalPrice.toFixed(2)}</span>
                </div>
              </div>
              
              <div class="info-box" style="background: #fef3c7; border-color: #f59e0b;">
                <h4 style="margin: 0 0 10px 0; color: #92400e;">What's Next?</h4>
                <ul style="margin: 0; padding-left: 20px;">
                  <li>Our team is now finalizing your room reservation</li>
                  <li>You will receive a <strong>final confirmation email</strong> shortly</li>
                  <li>Please present this email or your booking ID at check-in</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin-top: 30px;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/my-bookings" class="btn" style="background: #10b981;">View My Bookings</a>
              </div>
              
              <p style="margin-top: 30px;">If you have any questions, please don't hesitate to contact us.</p>
              <p>Thank you for choosing Nonsa Travels!</p>
            </div>
            ${emailFooter()}
          </div>
        </body>
      </html>
    `,
    text: `
Payment Confirmed - ${hotel?.name || 'Your Booking'}

Dear ${booking.userName},

Great news! We have successfully received and verified your payment for your upcoming stay at ${hotel?.name || 'our hotel'}.

PAYMENT STATUS: CONFIRMED
Amount Received: $${booking.totalPrice.toFixed(2)}
Payment Method: ${booking.paymentMethod?.toUpperCase() || 'N/A'}

Booking Summary:
- Booking ID: ${booking._id}
- Hotel: ${hotel?.name || 'N/A'}
- Check-in: ${checkIn.toDateString()}
- Check-out: ${checkOut.toDateString()}
- Duration: ${nights} Night(s)
- Guests: ${booking.guests}
- Total Paid: $${booking.totalPrice.toFixed(2)}

What's Next?
- Our team is now finalizing your room reservation
- You will receive a final confirmation email shortly
- Please present this email or your booking ID at check-in

View your bookings: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/my-bookings

Thank you for choosing Nonsa Travels!
    `,
  };
};
