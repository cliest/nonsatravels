// Email templates for authentication-related emails
import { emailHeader, emailFooter, emailStyles } from './emailTemplates.js';

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://nonsatravels-web-production.up.railway.app';

// Email verification email
export const emailVerificationEmail = (user, verificationToken) => {
  const verificationUrl = `${FRONTEND_URL}/verify-email?token=${verificationToken}`;
  
  return {
    subject: 'Verify Your Email - Nonsa Travels',
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
            ${emailHeader('Verify Your Email', 'One more step to complete your registration', '#4F46E5 0%, #7C3AED 100%')}
            <div class="content">
              <p>Hello ${user.firstName},</p>
              <p>Welcome to Nonsa Travels!</p>
              <p>Please verify your email address to complete your registration and unlock all features:</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" class="btn" style="background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); display: inline-block; padding: 16px 40px; color: white; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 16px;">
                  Verify My Email
                </a>
              </div>

              <p style="font-size: 14px; color: #6b7280;">Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; font-size: 13px; color: #4F46E5; background: #f3f4f6; padding: 12px; border-radius: 8px;">
                ${verificationUrl}
              </p>

              <div class="info-box" style="background: #fef3c7; border-color: #f59e0b; margin-top: 20px;">
                <p style="margin: 0; color: #92400e;">
                  <strong>⏰ Note:</strong> This verification link will expire in 24 hours.
                </p>
              </div>

              <p style="margin-top: 30px;">If you didn't create an account with Nonsa Travels, you can safely ignore this email.</p>
              
              <p style="margin-top: 30px;">Best regards,<br><strong>The Nonsa Travels Team</strong></p>
            </div>
            ${emailFooter()}
          </div>
        </body>
      </html>
    `,
    text: `
Hello ${user.firstName},

Welcome to Nonsa Travels!

Please verify your email address by clicking the link below:

${verificationUrl}

This link will expire in 24 hours.

If you didn't create an account with us, please ignore this email.

Best regards,
The Nonsa Travels Team
    `,
  };
};

// Welcome email after verification
export const welcomeEmail = (user) => {
  return {
    subject: 'Welcome to Nonsa Travels!',
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
            ${emailHeader('Welcome!', 'Your email has been verified', '#10b981 0%, #059669 100%')}
            <div class="content">
              <p>Hi ${user.firstName},</p>
              <p>Your email has been successfully verified! You're all set to start exploring amazing hotels and destinations with Nonsa Travels.</p>
              
              <div style="background: #f0fdf4; padding: 20px; border-radius: 12px; margin: 20px 0; border-left: 4px solid #10b981;">
                <h3 style="margin: 0 0 10px 0; color: #047857;">Account Verified!</h3>
                <p style="margin: 0; color: #065f46;">You now have full access to all features.</p>
              </div>

              <h3 style="color: #374151;">What You Can Do Now:</h3>
              <ul style="line-height: 2;">
                <li>Browse and book amazing hotels</li>
                <li>Save your favorite properties</li>
                <li>Earn loyalty points with every booking</li>
                <li>Refer friends and get discounts</li>
                <li>Plan and share trip itineraries</li>
              </ul>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${FRONTEND_URL}/hotels" class="btn" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); display: inline-block; padding: 16px 40px; color: white; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 16px;">
                  Start Exploring Hotels
                </a>
              </div>
              
              <p style="margin-top: 30px;">Happy travels!</p>
              <p style="margin-top: 20px;">Warm regards,<br><strong>The Nonsa Travels Team</strong></p>
            </div>
            ${emailFooter()}
          </div>
        </body>
      </html>
    `,
    text: `
Hi ${user.firstName},

Your email has been successfully verified! You're all set to start exploring amazing hotels and destinations with Nonsa Travels.

What You Can Do Now:
- Browse and book amazing hotels
- Save your favorite properties
- Earn loyalty points with every booking
- Refer friends and get discounts
- Plan and share trip itineraries

Start exploring: ${FRONTEND_URL}/hotels

Happy travels!

Warm regards,
The Nonsa Travels Team
    `,
  };
};

// Password reset request email
export const passwordResetEmail = (user, resetToken) => {
  const resetUrl = `${FRONTEND_URL}/reset-password?token=${resetToken}`;
  
  return {
    subject: 'Reset Your Password - Nonsa Travels',
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
            ${emailHeader('Password Reset', 'You requested to reset your password', '#f59e0b 0%, #d97706 100%')}
            <div class="content">
              <p>Hello ${user.firstName},</p>
              <p>We received a request to reset your password for your Nonsa Travels account.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" class="btn" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); display: inline-block; padding: 16px 40px; color: white; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 16px;">
                  Reset My Password
                </a>
              </div>

              <p style="font-size: 14px; color: #6b7280;">Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; font-size: 13px; color: #f59e0b; background: #fffbeb; padding: 12px; border-radius: 8px;">
                ${resetUrl}
              </p>

              <div class="info-box" style="background: #fef2f2; border-color: #ef4444; margin-top: 20px;">
                <p style="margin: 0; color: #991b1b;">
                  <strong>Important:</strong> This link will expire in 1 hour for security reasons.
                </p>
              </div>

              <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin-top: 20px;">
                <p style="margin: 0; font-size: 14px; color: #4b5563;">
                  <strong>Didn't request this?</strong><br>
                  If you didn't request a password reset, please ignore this email. Your password will remain unchanged, and your account is secure.
                </p>
              </div>
              
              <p style="margin-top: 30px;">Best regards,<br><strong>The Nonsa Travels Team</strong></p>
            </div>
            ${emailFooter()}
          </div>
        </body>
      </html>
    `,
    text: `
Hello ${user.firstName},

We received a request to reset your password for your Nonsa Travels account.

Click the link below to reset your password:

${resetUrl}

This link will expire in 1 hour.

If you didn't request this, please ignore this email. Your password will remain unchanged.

Best regards,
The Nonsa Travels Team
    `,
  };
};

// Password changed confirmation email
export const passwordChangedEmail = (user) => {
  return {
    subject: 'Password Changed Successfully - Nonsa Travels',
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
            ${emailHeader('Password Changed', 'Your password has been updated', '#10b981 0%, #059669 100%')}
            <div class="content">
              <p>Hello ${user.firstName},</p>
              <p>This is a confirmation that your password has been successfully changed.</p>
              
              <div style="background: #f0fdf4; padding: 20px; border-radius: 12px; margin: 20px 0; border-left: 4px solid #10b981;">
                <h3 style="margin: 0 0 10px 0; color: #047857;">Password Updated</h3>
                <p style="margin: 0; color: #065f46;">Your account password has been changed successfully.</p>
              </div>

              <div class="info-box" style="background: #fef2f2; border-color: #ef4444; margin-top: 20px;">
                <p style="margin: 0; color: #991b1b;">
                  <strong>WARNING - Unauthorized Access Attempt:</strong><br>
                  If you didn't make this change, please contact us immediately at <a href="mailto:support@nonsatravels.com" style="color: #dc2626;">support@nonsatravels.com</a> or call +260 977 123 456.
                </p>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${FRONTEND_URL}/login" class="btn" style="background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); display: inline-block; padding: 16px 40px; color: white; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 16px;">
                  Sign In to Your Account
                </a>
              </div>
              
              <p style="margin-top: 30px;">Best regards,<br><strong>The Nonsa Travels Team</strong></p>
            </div>
            ${emailFooter()}
          </div>
        </body>
      </html>
    `,
    text: `
Hello ${user.firstName},

This is a confirmation that your password has been successfully changed.

If you didn't make this change, please contact us immediately at support@nonsatravels.com or call +260 977 123 456.

Best regards,
The Nonsa Travels Team
    `,
  };
};
