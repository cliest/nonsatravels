// Email templates for different booking stages
// Modern, professional email templates with logo support

// Logo URL - Using the deployed frontend's public logo
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://nonsatravels.com';
const LOGO_URL = process.env.LOGO_URL || `${FRONTEND_URL}/logo.png`;
const COMPANY_NAME = 'Nonsa Travels';
const SUPPORT_EMAIL = 'support@nonsatravels.com';
const BRAND_COLOR = '#2b3990'; // Primary blue
const SECONDARY_COLOR = '#ffa500'; // Secondary orange
const BRAND_GRADIENT = 'linear-gradient(135deg, #2b3990 0%, #1e2a6e 100%)';

// Email subject lines
export const EMAIL_SUBJECTS = {
  BOOKING_CREATED: 'Payment Successful - Booking Under Review',
  BOOKING_CONFIRMED: 'Booking Confirmed',
  BOOKING_CANCELLED: 'Booking Cancelled',
  BOOKING_REMINDER: 'Reminder: Check-in Tomorrow!',
  BOOKING_MODIFIED: 'Booking Modified Successfully',
  CHAT_TRANSCRIPT: 'Chat Transcript - Nonsa Travels',
};

// Professional email banner with logo on left - white background for logo visibility
const emailBanner = () => `
  <div style="background: #ffffff; padding: 0; border-bottom: 3px solid ${SECONDARY_COLOR};">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="padding: 20px 30px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <!-- Logo on Left -->
              <td style="vertical-align: middle; width: 50%;">
                <a href="${FRONTEND_URL}" style="text-decoration: none; display: inline-block;">
                  <img src="${LOGO_URL}" alt="${COMPANY_NAME}" style="max-width: 180px; height: auto; display: block;" />
                </a>
              </td>
              <!-- Contact Info on Right -->
              <td style="vertical-align: middle; text-align: right; width: 50%;">
                <p style="margin: 0 0 4px 0; font-size: 12px; color: ${BRAND_COLOR}; font-weight: 500;">
                  +260 970 462 777
                </p>
                <p style="margin: 0 0 4px 0; font-size: 12px; color: ${BRAND_COLOR}; font-weight: 500;">
                  info@nonsatravels.com
                </p>
                <p style="margin: 0; font-size: 12px; color: #64748b;">
                  Kwacha Street, Chingola
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
`;

// Reusable email header with modern design
export const emailHeader = (title, subtitle, customGradient = null) => `
  ${emailBanner()}
  <div class="header" style="background: ${customGradient || 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'}; padding: 40px 30px; text-align: center; border-bottom: 4px solid ${SECONDARY_COLOR};">
    <h1 style="margin: 0 0 12px 0; font-size: 28px; font-weight: 700; color: ${customGradient ? 'white' : '#1e293b'}; letter-spacing: -0.5px;">${title}</h1>
    <p style="margin: 0; font-size: 16px; color: ${customGradient ? 'rgba(255,255,255,0.9)' : '#64748b'}; font-weight: 400;">${subtitle}</p>
  </div>
`;

// Reusable email footer with modern contact details
export const emailFooter = () => `
  <div class="footer" style="background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%); padding: 40px 30px; text-align: center;">
    <!-- Contact Card -->
    <div style="background: white; border-radius: 16px; padding: 30px; margin-bottom: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
      <h3 style="margin: 0 0 20px 0; font-size: 18px; font-weight: 700; color: #1e293b;">Need Help? Contact Us</h3>
      
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 12px; text-align: center; border-bottom: 1px solid #e2e8f0;">
            <div style="font-size: 14px; font-weight: 600; color: #1e293b; margin-bottom: 8px;">Email</div>
            <a href="mailto:info@nonsatravels.com" style="color: ${BRAND_COLOR}; text-decoration: none; font-weight: 600; font-size: 14px;">info@nonsatravels.com</a>
          </td>
          <td style="padding: 12px; text-align: center; border-bottom: 1px solid #e2e8f0;">
            <div style="font-size: 14px; font-weight: 600; color: #1e293b; margin-bottom: 8px;">Phone</div>
            <span style="color: #1e293b; font-weight: 600; font-size: 14px;">+260 970 462 777</span>
          </td>
        </tr>
        <tr>
          <td colspan="2" style="padding: 16px; text-align: center;">
            <div style="font-size: 14px; font-weight: 600; color: #1e293b; margin-bottom: 8px;">Address</div>
            <span style="color: #1e293b; font-size: 14px;">Kwacha Street, Chingola, Zambia</span>
          </td>
        </tr>
      </table>
      
      <!-- Social Links -->
      <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
        <p style="margin: 0 0 12px 0; font-size: 12px; color: #64748b;">Follow us on social media</p>
        <div>
          <a href="https://facebook.com/nonsatravels" style="display: inline-block; margin: 0 8px; padding: 10px 16px; background: #f1f5f9; border-radius: 8px; text-decoration: none; color: #475569; font-size: 13px; font-weight: 500;">Facebook</a>
          <a href="https://twitter.com/nonsatravels" style="display: inline-block; margin: 0 8px; padding: 10px 16px; background: #f1f5f9; border-radius: 8px; text-decoration: none; color: #475569; font-size: 13px; font-weight: 500;">Twitter</a>
          <a href="https://instagram.com/nonsatravels" style="display: inline-block; margin: 0 8px; padding: 10px 16px; background: #f1f5f9; border-radius: 8px; text-decoration: none; color: #475569; font-size: 13px; font-weight: 500;">Instagram</a>
        </div>
      </div>
    </div>
    
    <!-- Legal Footer -->
    <div style="color: #94a3b8; font-size: 12px; line-height: 1.6;">
      <p style="margin: 0 0 8px 0;">© ${new Date().getFullYear()} ${COMPANY_NAME}. All rights reserved.</p>
      <p style="margin: 0 0 8px 0;">Business Hours: Mon-Fri 8AM-6PM | Sat 9AM-4PM</p>
      <p style="margin: 0 0 8px 0;">Kwacha Street, Chingola, Zambia</p>
      <p style="margin: 0 0 12px 0; font-size: 11px;">This is a transactional email regarding your booking or account with ${COMPANY_NAME}.</p>
      <p style="margin: 0; font-size: 11px;">
        <a href="mailto:${SUPPORT_EMAIL}" style="color: #64748b; text-decoration: underline;">Contact Support</a> | 
        <a href="${FRONTEND_URL}/unsubscribe" style="color: #64748b; text-decoration: underline;">Unsubscribe</a> | 
        <a href="${FRONTEND_URL}/privacy" style="color: #64748b; text-decoration: underline;">Privacy Policy</a>
      </p>
    </div>
  </div>
`;

// Modern email styles with better typography and spacing
export const emailStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  
  * { box-sizing: border-box; }
  body { 
    font-family: 'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif; 
    line-height: 1.6; 
    color: #1e293b; 
    margin: 0; 
    padding: 0; 
    background-color: #f1f5f9; 
    -webkit-font-smoothing: antialiased;
  }
  .container { 
    max-width: 600px; 
    margin: 0 auto; 
    background: white; 
    border-radius: 0; 
    overflow: hidden; 
  }
  @media screen and (min-width: 640px) {
    .container { 
      margin: 24px auto; 
      border-radius: 16px; 
      box-shadow: 0 4px 24px rgba(0,0,0,0.08); 
    }
  }
  .content { 
    background: #ffffff; 
    padding: 32px 24px; 
  }
  @media screen and (min-width: 640px) {
    .content { padding: 40px 32px; }
  }
  .content p { 
    margin: 0 0 16px 0; 
    color: #475569; 
    font-size: 15px; 
    line-height: 1.7; 
  }
  .content p:first-of-type { 
    font-size: 16px; 
    color: #1e293b; 
  }
  .booking-details { 
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); 
    padding: 24px; 
    border-radius: 12px; 
    margin: 24px 0; 
    border: 1px solid #e2e8f0; 
  }
  .booking-details h2 { 
    margin: 0 0 20px 0; 
    color: #1e293b; 
    font-size: 18px; 
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .detail-row { 
    display: flex; 
    justify-content: space-between; 
    align-items: center;
    padding: 14px 0; 
    border-bottom: 1px solid #e2e8f0; 
  }
  .detail-row:last-child { border-bottom: none; }
  .detail-label { 
    font-weight: 600; 
    color: #64748b; 
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .detail-value {
    font-weight: 600;
    color: #1e293b;
    font-size: 15px;
  }
  .total { 
    font-size: 28px; 
    color: ${BRAND_COLOR}; 
    font-weight: 800; 
  }
  .status-badge { 
    display: inline-block; 
    padding: 8px 16px; 
    border-radius: 50px; 
    font-weight: 600; 
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .status-pending { background: #fef3c7; color: #b45309; }
  .status-confirmed { background: #d1fae5; color: #047857; }
  .status-cancelled { background: #fee2e2; color: #dc2626; }
  .btn { 
    display: inline-block; 
    padding: 14px 32px; 
    background: ${BRAND_GRADIENT}; 
    color: white !important; 
    text-decoration: none; 
    border-radius: 10px; 
    font-weight: 600; 
    font-size: 15px;
    margin: 8px 0;
    box-shadow: 0 4px 14px rgba(43, 57, 144, 0.3);
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .btn:hover { 
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(43, 57, 144, 0.4);
  }
  .btn-secondary {
    background: #f1f5f9;
    color: #475569 !important;
    box-shadow: none;
    border: 1px solid #e2e8f0;
  }
  .info-box { 
    background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); 
    padding: 20px 24px; 
    border-left: 4px solid ${BRAND_COLOR}; 
    border-radius: 0 12px 12px 0; 
    margin: 24px 0; 
  }
  .info-box h4 {
    margin: 0 0 12px 0;
    color: ${BRAND_COLOR};
    font-size: 15px;
    font-weight: 700;
  }
  .info-box ul { margin: 0; padding-left: 20px; }
  .info-box li { 
    margin: 10px 0; 
    color: #475569;
    font-size: 14px;
  }
  .success-box {
    background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
    border-left-color: #10b981;
  }
  .success-box h4, .success-box li { color: #047857; }
  .warning-box {
    background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
    border-left-color: #f59e0b;
  }
  .warning-box h4, .warning-box li { color: #b45309; }
  .divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
    margin: 32px 0;
  }
`;

export const bookingCreatedEmail = (booking, hotel) => {
  return {
    subject: 'Payment Successful - Booking Under Review',
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
            ${emailHeader('Payment Received!', 'Your booking is being processed', '#3b82f6 0%, #2563eb 100%')}
            <div class="content">
              <p>Dear ${booking.userName},</p>
              <p>Thank you for choosing Nonsa Travels! Your payment has been successfully processed.</p>
              <p><strong>Booking Status: <span class="status-badge">Pending Admin Review</span></strong></p>
              <p>Your reservation is currently being reviewed by our team. We'll confirm your booking and room availability within <strong>24 hours</strong>.</p>
              
              <div class="booking-details">
                <h2>Booking Summary</h2>
                <div class="detail-row">
                  <span class="detail-label">Booking Reference:</span>
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
                  <span class="detail-label">Number of Guests:</span>
                  <span>${booking.guests} guest(s)</span>
                </div>
              </div>

              <div style="background: #d1fae5; padding: 20px; border-left: 4px solid #10b981; border-radius: 8px; margin: 25px 0;">
                <h3 style="margin-top: 0; color: #047857; font-size: 18px;">Payment Information</h3>
                <div style="background: white; padding: 15px; border-radius: 6px; margin-top: 15px;">
                  <div style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                    <span style="font-weight: 600; color: #047857;">Payment Method:</span>
                    <span style="float: right; font-weight: bold;">${booking.paymentMethod?.toUpperCase() || 'N/A'}</span>
                  </div>
                  <div style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                    <span style="font-weight: 600; color: #047857;">Transaction ID:</span>
                    <span style="float: right; font-family: monospace; font-size: 12px;">${booking.paymentId || 'N/A'}</span>
                  </div>
                  <div style="padding: 10px 0;">
                    <span style="font-weight: 600; color: #047857;">Amount:</span>
                    <span style="float: right; font-weight: bold; font-size: 20px; color: #10b981;">$${booking.totalPrice}</span>
                  </div>
                </div>
                <p style="margin: 15px 0 0 0; font-size: 13px; color: #047857;">Payment transaction completed. Our team will verify receipt of funds during review.</p>
              </div>

              <p><strong>What Happens Next?</strong></p>
              <div class="info-box">
                <ul>
                  <li><strong>Payment Submitted:</strong> Your payment of $${booking.totalPrice} has been submitted</li>
                  <li><strong>Verification Process:</strong> Our team will verify receipt of payment and confirm room availability</li>
                  <li><strong>Final Confirmation:</strong> You'll receive a confirmation email within 24 hours</li>
                  <li><strong>Keep This Email:</strong> Use your Booking Reference for any inquiries</li>
                </ul>
                <p style="margin-top: 15px; padding: 12px; background: #fef3c7; border-radius: 5px; font-size: 13px;">
                  <strong>Note:</strong> Your booking will be confirmed once our team verifies payment and room availability. If there are any issues, we'll contact you immediately and process a full refund if needed.
                </p>
              </div>
              
              <p style="margin-top: 30px;">If you have any questions, feel free to contact us at support@nonsatravels.com</p>
              <p style="margin-top: 20px;">Best regards,<br><strong>The Nonsa Travels Team</strong></p>
            </div>
            ${emailFooter()}
          </div>
        </body>
      </html>
    `,
    text: `
Payment Successful - Booking Under Review

Dear ${booking.userName},

Thank you for choosing Nonsa Travels! Your payment has been successfully processed.

Booking Status: Pending Admin Review

Your reservation is currently being reviewed by our team. We'll confirm your booking and room availability within 24 hours.

Booking Summary:
- Booking Reference: ${booking._id}
- Hotel: ${hotel?.name || 'N/A'}
- Check-in Date: ${new Date(booking.checkInDate).toLocaleDateString()}
- Check-out Date: ${new Date(booking.checkOutDate).toLocaleDateString()}
- Number of Guests: ${booking.guests}

Payment Confirmation:
- Payment Method: ${booking.paymentMethod?.toUpperCase() || 'N/A'}
- Transaction ID: ${booking.paymentId || 'N/A'}
- Amount: $${booking.totalPrice}
Payment transaction completed. Our team will verify receipt of funds during review.

What Happens Next?
Payment Submitted: Your payment of $${booking.totalPrice} has been submitted
Verification Process: Our team will verify receipt of payment and confirm room availability
Final Confirmation: You'll receive a confirmation email within 24 hours
Keep This Email: Use your Booking Reference for any inquiries

Note: Your booking will be confirmed once our team verifies payment and room availability. If there are any issues, we'll contact you immediately and process a full refund if needed.

If you have any questions, contact us at support@nonsatravels.com

Best regards,
The Nonsa Travels Team

Contact Information:
Email: info@nonsatravels.com | support@nonsatravels.com
Phone: +260 970 462 777
Address: Kwacha Street, Chingola, Zambia
Business Hours: Monday - Friday: 8:00 AM - 6:00 PM | Saturday: 9:00 AM - 4:00 PM
    `,
  };
};

export const bookingConfirmedByAdminEmail = (booking, hotel) => {
  return {
    subject: 'Booking Confirmed by Admin - Ready for Your Stay!',
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
            ${emailHeader('Booking Confirmed!', 'Your booking has been approved', '#10b981 0%, #059669 100%')}
            <div class="content">
              <p>Dear ${booking.userName},</p>
              <p>Great news! Your payment has been verified and your booking has been <span class="status-badge">Confirmed</span> by our admin team. You're all set for your stay!</p>
              
              <div class="booking-details">
                <h2>Confirmed Booking Details</h2>
                <div class="detail-row">
                  <span class="detail-label">Booking ID:</span>
                  <span>${booking._id}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Hotel:</span>
                  <span>${hotel?.name || 'N/A'}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Check-in:</span>
                  <span>${new Date(booking.checkInDate).toLocaleDateString()}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Check-out:</span>
                  <span>${new Date(booking.checkOutDate).toLocaleDateString()}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Guests:</span>
                  <span>${booking.guests} guest(s)</span>
                </div>
              </div>

              <p><strong>Important Information:</strong></p>
              <ul style="background: #d1fae5; padding: 15px 20px; border-left: 4px solid #10b981; border-radius: 5px;">
                <li><strong>Payment Verified:</strong> Your payment has been confirmed by our team</li>
                <li><strong>Room Reserved:</strong> Your room is now reserved for your dates</li>
                <li><strong>Check-in:</strong> After 2:00 PM on your check-in date</li>
                <li><strong>Check-out:</strong> By 11:00 AM on your check-out date</li>
                <li><strong>Requirements:</strong> Bring valid ID and booking confirmation</li>
              </ul>
              
              <p style="margin-top: 30px;">We look forward to hosting you!</p>
              <p>Best regards,<br><strong>Nonsa Travels Team</strong></p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Nonsa Travels. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
Booking Confirmed by Admin

Dear ${booking.userName},

Great news! Your payment has been verified and your booking has been confirmed by our admin team.

Confirmed Booking Details:
- Booking ID: ${booking._id}
- Hotel: ${hotel?.name || 'N/A'}
- Check-in: ${new Date(booking.checkInDate).toLocaleDateString()}
- Check-out: ${new Date(booking.checkOutDate).toLocaleDateString()}
- Guests: ${booking.guests}

Status: Confirmed

Important Information:
- Check-in time: After 2:00 PM
- Check-out time: 11:00 AM
- Please bring a valid ID

We look forward to hosting you!

Warm regards,
The Nonsa Travels Team

Contact Information:
Email: info@nonsatravels.com | support@nonsatravels.com
Phone: +260 970 462 777
Address: Kwacha Street, Chingola, Zambia
    `,
  };
};

export const bookingCancelledEmail = (booking, hotel) => {
  return {
    subject: 'Booking Cancelled',
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
            ${emailHeader('Booking Cancelled', 'Your booking has been cancelled', '#ef4444 0%, #dc2626 100%')}
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
                  <span class="detail-label">Amount:</span>
                  <span>$${booking.totalPrice}</span>
                </div>
              </div>

              <div class="info-box">
                <p style="margin: 0;"><strong>Refund Information:</strong></p>
                <p style="margin: 10px 0 0 0;">If you paid for this booking, a refund will be processed to your original payment method within 5-7 business days. For urgent refund inquiries, please contact us at support@nonsatravels.com.</p>
              </div>
              
              <p style="margin-top: 30px;">We hope to serve you again in the future!</p>
              <p style="margin-top: 20px;">Warm regards,<br><strong>The Nonsa Travels Team</strong></p>
            </div>
            ${emailFooter()}
          </div>
        </body>
      </html>
    `,
    text: `
Booking Cancelled

Dear ${booking.userName},

This email confirms that your booking has been cancelled.

Cancelled Booking Details:
- Booking ID: ${booking._id}
- Hotel: ${hotel?.name || 'N/A'}
- Amount: $${booking.totalPrice}

If you paid for this booking, a refund will be processed within 5-7 business days.

We hope to serve you again soon!

Warm regards,
The Nonsa Travels Team

Contact Information:
Email: info@nonsatravels.com | support@nonsatravels.com
Phone: +260 970 462 777
Address: Kwacha Street, Chingola, Zambia
    `,
  };
};

export const bookingStatusUpdatedEmail = (booking, hotel, oldStatus, newStatus) => {
  return {
    subject: `Booking Status Updated: ${newStatus}`,
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
            ${emailHeader('Booking Status Updated', 'Your booking status has changed', '#3b82f6 0%, #2563eb 100%')}
            <div class="content">
              <p>Dear ${booking.userName},</p>
              <p>Your booking status has been updated.</p>
              
              <div class="status-change">
                <h3>Status Change</h3>
                <div style="display: flex; align-items: center; justify-content: center; margin: 20px 0;">
                  <span class="status old-status">${oldStatus}</span>
                  <span class="arrow">→</span>
                  <span class="status new-status">${newStatus}</span>
                </div>
              </div>

              <p><strong>Booking ID:</strong> ${booking._id}</p>
              <p><strong>Hotel:</strong> ${hotel?.name || 'N/A'}</p>
              
              <div class="info-box">
                <p style="margin: 0;">If you have any questions about this status change, please don't hesitate to contact us at support@nonsatravels.com or call +260 970 462 777.</p>
              </div>
              
              <p style="margin-top: 30px;">Thank you for choosing Nonsa Travels!</p>
              <p style="margin-top: 20px;">Warm regards,<br><strong>The Nonsa Travels Team</strong></p>
            </div>
            ${emailFooter()}
          </div>
        </body>
      </html>
    `,
    text: `
Booking Status Updated

Dear ${booking.userName},

Your booking status has been updated from "${oldStatus}" to "${newStatus}".

Booking ID: ${booking._id}
Hotel: ${hotel?.name || 'N/A'}

If you have any questions, please contact us.

Best regards,
The Nonsa Travels Team

Contact Information:
Email: info@nonsatravels.com | support@nonsatravels.com
Phone: +260 970 462 777
Address: Kwacha Street, Chingola, Zambia
Business Hours: Monday - Friday: 8:00 AM - 6:00 PM | Saturday: 9:00 AM - 4:00 PM
    `,
  };
};

// Booking Modification Email
export const bookingModificationEmail = (booking, hotel, modifications) => {
  const formatDate = (date) => new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formatCurrency = (amount) => `$${amount.toFixed(2)}`;
  const priceDiff = modifications.priceDifference;
  const priceChangeHtml = priceDiff !== 0 ? `
    <div style="background: ${priceDiff > 0 ? '#fef3c7' : '#d1fae5'}; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid ${priceDiff > 0 ? '#f59e0b' : '#10b981'};">
      <p style="margin: 0; font-weight: 600; color: ${priceDiff > 0 ? '#92400e' : '#065f46'};">
        ${priceDiff > 0 ? 'Price Increase' : 'Price Decrease'}
      </p>
      <p style="margin: 5px 0 0 0; font-size: 14px; color: ${priceDiff > 0 ? '#92400e' : '#065f46'};">
        ${priceDiff > 0 ? 'Additional' : 'You save'} ${formatCurrency(Math.abs(priceDiff))}
      </p>
    </div>
  ` : '';

  return {
    subject: 'Booking Modified Successfully',
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
            ${emailHeader('Booking Modified', 'Your reservation has been updated', '#8b5cf6 0%, #7c3aed 100%')}
            <div class="content">
              <p>Dear ${booking.userName},</p>
              <p>Great news! Your booking has been successfully modified.</p>
              
              <div class="booking-details">
                <h2>${hotel.name}</h2>
                <p style="color: #6b7280; margin: 5px 0 15px 0;">${hotel.location}</p>

                <h3 style="color: #667eea; margin: 20px 0 10px 0;">Previous Details</h3>
                <div class="detail-row">
                  <span class="detail-label">Check-in:</span>
                  <span style="text-decoration: line-through; color: #9ca3af;">${formatDate(modifications.oldCheckIn)}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Check-out:</span>
                  <span style="text-decoration: line-through; color: #9ca3af;">${formatDate(modifications.oldCheckOut)}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Guests:</span>
                  <span style="text-decoration: line-through; color: #9ca3af;">${modifications.oldGuests}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Total Price:</span>
                  <span style="text-decoration: line-through; color: #9ca3af;">${formatCurrency(modifications.oldPrice)}</span>
                </div>

                <h3 style="color: #10b981; margin: 20px 0 10px 0;">Updated Details</h3>
                <div class="detail-row">
                  <span class="detail-label">Check-in:</span>
                  <span style="font-weight: 600; color: #10b981;">${formatDate(modifications.newCheckIn)}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Check-out:</span>
                  <span style="font-weight: 600; color: #10b981;">${formatDate(modifications.newCheckOut)}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Guests:</span>
                  <span style="font-weight: 600;">${modifications.newGuests}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Booking ID:</span>
                  <span style="font-family: monospace; font-size: 12px;">${booking._id}</span>
                </div>
                <div class="detail-row" style="background: #f0f9ff; padding: 15px; margin-top: 10px; border-radius: 6px;">
                  <span class="detail-label" style="font-size: 18px;">New Total Price:</span>
                  <span class="total">${formatCurrency(modifications.newPrice)}</span>
                </div>
              </div>

              ${priceChangeHtml}

              <div class="info-box">
                <p style="margin: 0 0 10px 0; font-weight: 600; color: #1f2937;">Important Information:</p>
                <ul style="margin: 0; padding-left: 20px;">
                  <li>Your booking confirmation number remains the same</li>
                  <li>Check-in time: 2:00 PM | Check-out time: 11:00 AM</li>
                  ${priceDiff > 0 ? '<li>The price difference will be charged to your original payment method</li>' : ''}
                  ${priceDiff < 0 ? '<li>Refund will be processed within 5-7 business days</li>' : ''}
                  <li>Further modifications can be made up to 24 hours before check-in</li>
                </ul>
              </div>

              <p style="margin-top: 25px;">If you have any questions about your modified booking, please don't hesitate to contact us.</p>
              <p style="margin-top: 20px;">We look forward to welcoming you!<br><strong>The Nonsa Travels Team</strong></p>
            </div>
            ${emailFooter()}
          </div>
        </body>
      </html>
    `,
    text: `
Booking Modified Successfully

Dear ${booking.userName},

Great news! Your booking has been successfully modified.

${hotel.name}
${hotel.location}

PREVIOUS DETAILS:
- Check-in: ${formatDate(modifications.oldCheckIn)}
- Check-out: ${formatDate(modifications.oldCheckOut)}
- Guests: ${modifications.oldGuests}
- Total Price: ${formatCurrency(modifications.oldPrice)}

UPDATED DETAILS:
- Check-in: ${formatDate(modifications.newCheckIn)}
- Check-out: ${formatDate(modifications.newCheckOut)}
- Guests: ${modifications.newGuests}
- Booking ID: ${booking._id}
- New Total Price: ${formatCurrency(modifications.newPrice)}

${priceDiff !== 0 ? `\nPRICE CHANGE:\n${priceDiff > 0 ? 'Additional' : 'You save'} ${formatCurrency(Math.abs(priceDiff))}\n` : ''}

Important Information:
- Your booking confirmation number remains the same
- Check-in time: 2:00 PM | Check-out time: 11:00 AM
${priceDiff > 0 ? '- The price difference will be charged to your original payment method\n' : ''}
${priceDiff < 0 ? '- Refund will be processed within 5-7 business days\n' : ''}
- Further modifications can be made up to 24 hours before check-in

If you have any questions about your modified booking, please don't hesitate to contact us.

We look forward to welcoming you!
The Nonsa Travels Team

Contact Information:
Email: info@nonsatravels.com | support@nonsatravels.com
Phone: +260 970 462 777
    `,
  };
};

// Chat transcript email template
export const chatTranscriptEmail = (chat) => {
  const messagesHtml = chat.messages.map(msg => `
    <div style="margin-bottom: 15px; padding: 12px; ${
      msg.sender === 'user' 
        ? 'background: #e3f2fd; border-left: 3px solid #2196f3;' 
        : 'background: #f3e5f5; border-left: 3px solid #9c27b0;'
    }">
      <div style="font-size: 11px; color: #666; margin-bottom: 5px;">
        <strong>${msg.senderName}</strong> • ${new Date(msg.timestamp).toLocaleString()}
      </div>
      <div style="white-space: pre-wrap;">${msg.message}</div>
    </div>
  `).join('');

  return {
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
            ${emailHeader('Chat Transcript', 'Your conversation with our support team', '#2b3990 0%, #ffa500 100%')}
            <div class="content">
              <p>Dear ${chat.userName},</p>
              <p>Thank you for chatting with us! Here's a transcript of your conversation:</p>
              
              <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0 0 5px 0; font-weight: 600;">Chat Details</p>
                <p style="margin: 5px 0; font-size: 13px;">Date: ${new Date(chat.createdAt).toLocaleString()}</p>
                <p style="margin: 5px 0; font-size: 13px;">Status: ${chat.status}</p>
                ${chat.rating?.score ? `<p style="margin: 5px 0; font-size: 13px;">Your Rating: ${chat.rating.score}/5</p>` : ''}
              </div>

              <div style="margin: 20px 0;">
                <h3 style="color: #2b3990; margin-bottom: 15px;">Conversation</h3>
                ${messagesHtml}
              </div>

              <p style="margin-top: 30px;">If you have any further questions, feel free to start a new chat or contact us directly.</p>
              <p style="margin-top: 20px;">Best regards,<br><strong>The Nonsa Travels Team</strong></p>
            </div>
            ${emailFooter()}
          </div>
        </body>
      </html>
    `,
    text: `
Chat Transcript - Nonsa Travels

Dear ${chat.userName},

Thank you for chatting with us! Here's a transcript of your conversation:

Chat Details:
- Date: ${new Date(chat.createdAt).toLocaleString()}
- Status: ${chat.status}
${chat.rating?.score ? `- Your Rating: ${chat.rating.score}/5 stars\n` : ''}

Conversation:
${chat.messages.map(msg => `
[${new Date(msg.timestamp).toLocaleString()}] ${msg.senderName}:
${msg.message}
`).join('\n')}

If you have any further questions, feel free to start a new chat or contact us directly.

Best regards,
The Nonsa Travels Team

Contact Information:
Email: info@nonsatravels.com | support@nonsatravels.com
Phone: +260 970 462 777
    `,
  };
};
