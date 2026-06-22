import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config({ override: true });

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM_EMAIL = process.env.EMAIL_FROM || 'Nonsa Travels <reservations@nonsatravels.com>';
const REPLY_TO_EMAIL = process.env.REPLY_TO_EMAIL || 'support@nonsatravels.com';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://nonsatravels-web-production.up.railway.app';

const htmlToPlainText = (html) => {
  if (!html) return '';
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '\n')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .trim();
};

export const sendEmail = async ({ to, subject, html, text, replyTo, tags = [], attachments = [] }) => {
  if (process.env.SKIP_EMAILS === 'true') {
    console.log(`Email skipped (SKIP_EMAILS=true): To: ${to}, Subject: ${subject}`);
    return { id: `skipped-${Date.now()}`, skipped: true };
  }

  if (!process.env.RESEND_API_KEY) {
    console.log(`Email skipped (No RESEND_API_KEY): To: ${to}, Subject: ${subject}`);
    return { id: `no-api-key-${Date.now()}`, skipped: true };
  }

  try {
    const plainText = text || htmlToPlainText(html);

    const emailPayload = {
      from: FROM_EMAIL,
      to: Array.isArray(to) ? to : [to],
      reply_to: replyTo || REPLY_TO_EMAIL,
      subject,
      html,
      text: plainText,
      headers: {
        'X-Entity-Ref-ID': `nonsa-${Date.now()}`,
        'List-Unsubscribe': `<mailto:unsubscribe@nonsatravels.com?subject=Unsubscribe>, <${FRONTEND_URL}/unsubscribe>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
      tags: [
        { name: 'source', value: 'nonsatravels' },
        { name: 'type', value: tags[0] || 'transactional' },
        ...tags.slice(1).map(tag => ({ name: 'category', value: tag })),
      ],
    };

    if (attachments && attachments.length > 0) {
      emailPayload.attachments = attachments;
    }

    const { data, error } = await resend.emails.send(emailPayload);

    if (error) {
      console.error('Resend error:', error);
      throw new Error(error.message);
    }

    return { id: data.id, success: true };
  } catch (error) {
    console.error('Error sending email:', error.message);
    return { id: `failed-${Date.now()}`, failed: true, error: error.message };
  }
};

export const sendBookingEmail = async (options) => {
  return sendEmail({ ...options, tags: ['booking', options.bookingType || 'notification'] });
};

export const sendAuthEmail = async (options) => {
  return sendEmail({ ...options, tags: ['authentication', options.authType || 'verification'] });
};

export default { sendEmail, sendBookingEmail, sendAuthEmail };
