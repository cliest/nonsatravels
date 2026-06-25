import prisma from '../lib/prisma.js';
import { sendEmail } from '../utils/emailService.js';
import { emailHeader, emailFooter, emailStyles } from '../utils/emailTemplates.js';

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
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>${emailStyles}</style>
        </head>
        <body>
          <div class="container">
            ${emailHeader('New Contact Form Submission', 'Someone has reached out via the website', '#667eea 0%, #764ba2 100%')}
            <div class="content">
              <div class="booking-details">
                <div class="detail-row"><span class="detail-label">From:</span><span>${name}</span></div>
                <div class="detail-row"><span class="detail-label">Email:</span><span><a href="mailto:${email}">${email}</a></span></div>
                <div class="detail-row"><span class="detail-label">Subject:</span><span>${subject}</span></div>
              </div>
              <div class="info-box" style="margin-top: 20px;">
                <p style="margin: 0 0 8px 0; font-weight: 600;">Message:</p>
                <p style="white-space: pre-wrap; margin: 0;">${message}</p>
              </div>
              <p style="margin-top: 20px; color: #666; font-size: 14px;"><strong>Note:</strong> Please respond to this inquiry at your earliest convenience.</p>
            </div>
            ${emailFooter()}
          </div>
        </body>
      </html>
    `;

    const userEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>${emailStyles}</style>
        </head>
        <body>
          <div class="container">
            ${emailHeader('We Received Your Message', 'Our team will get back to you within 24 hours', '#667eea 0%, #764ba2 100%')}
            <div class="content">
              <p>Dear ${name},</p>
              <p>Thank you for contacting Nonsa Travels. We have received your message and our support team will get back to you within 24 hours.</p>
              <div class="info-box">
                <p style="font-weight: 600; margin: 0 0 8px 0;">Your Message Summary:</p>
                <p style="margin: 0 0 6px 0;"><strong>Subject:</strong> ${subject}</p>
                <p style="white-space: pre-wrap; margin: 0;">${message}</p>
              </div>
              <p style="margin-top: 30px;">Best regards,<br><strong>Nonsa Travels Support Team</strong></p>
            </div>
            ${emailFooter()}
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

    // Upsert — re-activates if previously unsubscribed
    const subscriber = await prisma.newsletterSubscriber.upsert({
      where: { email },
      update: { isActive: true },
      create: { email, source: 'website' },
    });

    if (!subscriber.isActive) {
      return res.status(200).json({ success: true, message: 'Successfully re-subscribed to newsletter!' });
    }

    const welcomeEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>${emailStyles}</style>
        </head>
        <body>
          <div class="container">
            ${emailHeader('Welcome to Nonsa Travels!', "You're now subscribed to our newsletter", '#667eea 0%, #764ba2 100%')}
            <div class="content">
              <p>Thank you for subscribing to our newsletter!</p>
              <p>You'll now receive exclusive updates about:</p>
              <div class="info-box">
                <ul>
                  <li>Special hotel deals and discounts</li>
                  <li>New destination launches</li>
                  <li>Travel tips and guides</li>
                  <li>Exclusive offers for subscribers</li>
                  <li>Industry news and updates</li>
                </ul>
              </div>
              <p>Start exploring our collection of amazing hotels and destinations!</p>
              <p style="margin-top: 30px;">Happy Travels,<br><strong>The Nonsa Travels Team</strong></p>
            </div>
            ${emailFooter()}
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

    res.status(200).json({ success: true, message: 'Successfully subscribed to newsletter! Check your email for confirmation.' });
  } catch (error) {
    console.error('Error subscribing to newsletter:', error);
    res.status(500).json({ success: false, message: 'Failed to subscribe. Please try again later.', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

// ─── Admin endpoints ─────────────────────────────────────────────────────────

export const getSubscribers = async (req, res) => {
  try {
    const { active } = req.query;
    const where = active !== undefined ? { isActive: active === 'true' } : {};
    const subscribers = await prisma.newsletterSubscriber.findMany({
      where,
      orderBy: { subscribedAt: 'desc' },
    });
    res.status(200).json({ success: true, data: subscribers, total: subscribers.length });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch subscribers', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

export const deleteSubscriber = async (req, res) => {
  try {
    await prisma.newsletterSubscriber.delete({ where: { id: req.params.id } });
    res.status(200).json({ success: true, message: 'Subscriber removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to remove subscriber' });
  }
};

export const unsubscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email required' });
    await prisma.newsletterSubscriber.updateMany({ where: { email }, data: { isActive: false } });
    res.status(200).json({ success: true, message: 'Successfully unsubscribed' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to unsubscribe' });
  }
};

export const sendNewsletter = async (req, res) => {
  try {
    const { subject, html, text, recipientIds } = req.body;

    if (!subject || !html) {
      return res.status(400).json({ success: false, message: 'Subject and HTML body are required' });
    }

    // Get active subscribers (or specific ones if recipientIds provided)
    const where = recipientIds?.length
      ? { id: { in: recipientIds }, isActive: true }
      : { isActive: true };

    const subscribers = await prisma.newsletterSubscriber.findMany({ where, select: { email: true } });

    if (!subscribers.length) {
      return res.status(400).json({ success: false, message: 'No active subscribers found' });
    }

    // Look up user names for personalization
    const emails = subscribers.map(s => s.email);
    const users = await prisma.user.findMany({
      where: { email: { in: emails } },
      select: { email: true, firstName: true, lastName: true },
    });
    const nameMap = {};
    users.forEach(u => { nameMap[u.email] = u.firstName || 'Subscriber'; });

    // Send in batches of 50, personalizing {{name}} per recipient
    const BATCH_SIZE = 50;
    let sent = 0;
    let failed = 0;

    for (let i = 0; i < emails.length; i += BATCH_SIZE) {
      const batch = emails.slice(i, i + BATCH_SIZE);
      const results = await Promise.allSettled(
        batch.map(to => {
          const name = nameMap[to] || 'Subscriber';
          const personalHtml = html.replace(/\{\{name\}\}/gi, name);
          const personalText = (text || subject).replace(/\{\{name\}\}/gi, name);
          const personalSubject = subject.replace(/\{\{name\}\}/gi, name);
          return sendEmail({ to, subject: personalSubject, html: personalHtml, text: personalText, tags: ['newsletter'] });
        })
      );
      results.forEach(r => r.status === 'fulfilled' && !r.value.failed ? sent++ : failed++);
    }

    res.status(200).json({
      success: true,
      message: `Newsletter sent to ${sent} subscriber${sent !== 1 ? 's' : ''}${failed ? ` (${failed} failed)` : ''}`,
      sent,
      failed,
      total: emails.length,
    });
  } catch (error) {
    console.error('Error sending newsletter:', error);
    res.status(500).json({ success: false, message: 'Failed to send newsletter', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};
