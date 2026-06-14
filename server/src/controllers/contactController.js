import { sendEmail } from '../utils/emailService.js';

export const sendContactEmail = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email address' });
    }

    const adminEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Montserrat', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .message-box { background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; border-radius: 4px; }
            .contact-info { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
            .info-row { padding: 8px 0; border-bottom: 1px solid #eee; }
            .label { font-weight: bold; color: #667eea; display: inline-block; width: 100px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Contact Form Submission</h1>
            </div>
            <div class="content">
              <div class="contact-info">
                <div class="info-row"><span class="label">From:</span> <span>${name}</span></div>
                <div class="info-row"><span class="label">Email:</span> <span><a href="mailto:${email}">${email}</a></span></div>
                <div class="info-row" style="border-bottom: none;"><span class="label">Subject:</span> <span>${subject}</span></div>
              </div>
              <div class="message-box">
                <h3>Message:</h3>
                <p style="white-space: pre-wrap;">${message}</p>
              </div>
              <p style="margin-top: 20px; color: #666; font-size: 14px;"><strong>Note:</strong> Please respond to this inquiry at your earliest convenience.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Nonsa Travels. All rights reserved.</p>
              <p>This is an automated notification from your contact form.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const userEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Montserrat', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .message-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>We Received Your Message</h1>
            </div>
            <div class="content">
              <p>Dear ${name},</p>
              <p>Thank you for contacting Nonsa Travels. We have received your message and our support team will get back to you within 24 hours.</p>
              <div class="message-box">
                <h3>Your Message Summary:</h3>
                <p><strong>Subject:</strong> ${subject}</p>
                <p style="white-space: pre-wrap;">${message}</p>
              </div>
              <p>In the meantime, you can:</p>
              <ul>
                <li>Browse our <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/faq">Frequently Asked Questions</a></li>
                <li>Explore our <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/hotels">Hotel Collection</a></li>
                <li>Check your <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/my-bookings">Bookings</a></li>
              </ul>
              <p style="margin-top: 30px;">Best regards,<br><strong>Nonsa Travels Support Team</strong></p>
              <p style="color: #666; font-size: 14px; margin-top: 20px;">
                <strong>Contact Information:</strong><br>
                Email: support@nonsatravels.com<br>
                Phone: +260 211 234 567<br>
                Working Hours: Mon-Fri 8AM-6PM, Sat 9AM-4PM
              </p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Nonsa Travels. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await sendEmail({
      to: process.env.SUPPORT_EMAIL || 'support@nonsatravels.com',
      subject: `Contact Form: ${subject}`,
      html: adminEmailHtml,
      text: `New contact form submission\n\nFrom: ${name} (${email})\nSubject: ${subject}\n\nMessage:\n${message}`,
    });

    await sendEmail({
      to: email,
      subject: 'We received your message - Nonsa Travels',
      html: userEmailHtml,
      text: `Dear ${name},\n\nThank you for contacting Nonsa Travels. We will get back to you within 24 hours.\n\nSubject: ${subject}\n${message}\n\nBest regards,\nNonsa Travels Support Team`,
    });

    res.status(200).json({ success: true, message: 'Your message has been sent successfully. We will get back to you soon!' });
  } catch (error) {
    console.error('Error sending contact email:', error);
    res.status(500).json({ success: false, message: 'Failed to send message. Please try again later.', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

export const subscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email address' });
    }

    const welcomeEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Montserrat', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .benefits { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .benefit-item { padding: 10px 0; border-bottom: 1px solid #eee; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Nonsa Travels!</h1>
            </div>
            <div class="content">
              <p>Thank you for subscribing to our newsletter!</p>
              <p>You'll now receive exclusive updates about:</p>
              <div class="benefits">
                <div class="benefit-item">Special hotel deals and discounts</div>
                <div class="benefit-item">New destination launches</div>
                <div class="benefit-item">Travel tips and guides</div>
                <div class="benefit-item">Exclusive offers for subscribers</div>
                <div class="benefit-item" style="border-bottom: none;">Industry news and updates</div>
              </div>
              <p>Start exploring our collection of amazing hotels and destinations!</p>
              <p style="margin-top: 30px;">Happy Travels,<br><strong>The Nonsa Travels Team</strong></p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Nonsa Travels. All rights reserved.</p>
              <p><a href="#">Unsubscribe</a> from this mailing list.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await sendEmail({
      to: email,
      subject: 'Welcome to Nonsa Travels Newsletter!',
      html: welcomeEmailHtml,
      text: `Thank you for subscribing to Nonsa Travels newsletter!\n\nYou'll receive exclusive updates about special deals, new destinations, travel tips, and more.\n\nHappy Travels,\nThe Nonsa Travels Team`,
    });

    await sendEmail({
      to: process.env.SUPPORT_EMAIL || 'support@nonsatravels.com',
      subject: 'New Newsletter Subscription',
      html: `<p>New subscriber: <strong>${email}</strong></p><p>Subscribed on: ${new Date().toLocaleString()}</p>`,
      text: `New subscriber: ${email}\nSubscribed on: ${new Date().toLocaleString()}`,
    });

    res.status(200).json({ success: true, message: 'Successfully subscribed to newsletter! Check your email for confirmation.' });
  } catch (error) {
    console.error('Error subscribing to newsletter:', error);
    res.status(500).json({ success: false, message: 'Failed to subscribe. Please try again later.', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};
