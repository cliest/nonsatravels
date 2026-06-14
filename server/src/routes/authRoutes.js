import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import axios from 'axios';
import prisma from '../lib/prisma.js';
import { sendEmail } from '../utils/emailService.js';
import {
  emailVerificationEmail,
  welcomeEmail,
  passwordResetEmail,
  passwordChangedEmail,
} from '../utils/authEmailTemplates.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable must be set');
}

const generateToken = (userId) => jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' });

const hashPassword = (password) => bcrypt.hash(password, 10);

const createVerificationToken = () => {
  const token = crypto.randomBytes(32).toString('hex');
  const hashed = crypto.createHash('sha256').update(token).digest('hex');
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return { token, hashed, expires };
};

const createResetToken = () => {
  const token = crypto.randomBytes(32).toString('hex');
  const hashed = crypto.createHash('sha256').update(token).digest('hex');
  const expires = new Date(Date.now() + 60 * 60 * 1000);
  return { token, hashed, expires };
};

const safeUser = (user) => ({
  id: user.id,
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  fullName: `${user.firstName} ${user.lastName}`.trim(),
  phone: user.phone,
  avatar: user.avatar,
  role: user.role,
  isVerified: user.isVerified,
  preferences: user.preferences,
  loyaltyPoints: user.loyaltyPoints,
  createdAt: user.createdAt,
});

// @route   POST /api/auth/register
router.post('/register', authLimiter, async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const hashedPassword = await hashPassword(password);
    const { token: verificationToken, hashed: hashedVerToken, expires: verExpires } = createVerificationToken();

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        isVerified: false,
        emailVerificationToken: hashedVerToken,
        emailVerificationExpires: verExpires,
      },
    });

    try {
      const emailContent = emailVerificationEmail(user, verificationToken);
      await sendEmail({ to: user.email, subject: emailContent.subject, html: emailContent.html, text: emailContent.text });
    } catch (e) { console.error('Failed to send verification email:', e); }

    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email to verify your account.',
      data: { user: safeUser(user), token },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: error.message || 'Registration failed' });
  }
});

// @route   POST /api/auth/login
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user.id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: { user: safeUser(user), token },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

// @route   GET /api/auth/me
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.status(200).json({ success: true, data: safeUser(user) });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Not authorized' });
  }
});

// @route   PUT /api/auth/profile
router.put('/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ success: false, message: 'Not authorized' });

    const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    const { firstName, lastName, phone, preferences } = req.body;

    const user = await prisma.user.update({
      where: { id: decoded.id },
      data: { firstName, lastName, phone, preferences },
    });

    res.status(200).json({ success: true, message: 'Profile updated successfully', data: safeUser(user) });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ success: false, message: 'User not found' });
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
});

// @route   PUT /api/auth/password
router.put('/password', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ success: false, message: 'Not authorized' });

    const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password || '');
    if (!isMatch) return res.status(400).json({ success: false, message: 'Current password is incorrect' });

    const hashedPassword = await hashPassword(newPassword);
    await prisma.user.update({ where: { id: decoded.id }, data: { password: hashedPassword } });

    res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to change password' });
  }
});

// @route   POST /api/auth/forgot-password
router.post('/forgot-password', authLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(200).json({ success: true, message: 'If an account with that email exists, a password reset link has been sent.' });
    }

    const { token: resetToken, hashed, expires } = createResetToken();

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordResetToken: hashed, passwordResetExpires: expires },
    });

    try {
      const resetURL = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
      const content = passwordResetEmail(user, resetURL);
      await sendEmail({ to: user.email, subject: content.subject, html: content.html, text: content.text });
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      await prisma.user.update({ where: { id: user.id }, data: { passwordResetToken: null, passwordResetExpires: null } });
      return res.status(500).json({ success: false, message: 'Failed to send password reset email. Please try again.' });
    }

    res.status(200).json({ success: true, message: 'Password reset email sent successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'An error occurred. Please try again.' });
  }
});

// @route   POST /api/auth/reset-password
router.post('/reset-password', authLimiter, async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ success: false, message: 'Token and password are required.' });

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: { gt: new Date() },
      },
    });

    if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired reset token.' });

    const hashedPassword = await hashPassword(password);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword, passwordResetToken: null, passwordResetExpires: null },
    });

    try {
      const content = passwordChangedEmail(user);
      await sendEmail({ to: user.email, subject: content.subject, html: content.html, text: content.text });
    } catch (e) { console.error('Failed to send password changed confirmation:', e); }

    res.status(200).json({ success: true, message: 'Password reset successfully. You can now log in with your new password.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to reset password.' });
  }
});

// @route   GET /api/auth/verify-email/:token
router.get('/verify-email/:token', async (req, res) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: hashedToken,
        emailVerificationExpires: { gt: new Date() },
      },
    });

    if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired verification token.' });

    await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true, emailVerificationToken: null, emailVerificationExpires: null },
    });

    try {
      const content = welcomeEmail(user);
      await sendEmail({ to: user.email, subject: content.subject, html: content.html, text: content.text });
    } catch (e) { console.error('Failed to send welcome email:', e); }

    res.status(200).json({ success: true, message: 'Email verified successfully! You can now log in.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Email verification failed.' });
  }
});

// @route   POST /api/auth/resend-verification
router.post('/resend-verification', authLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(200).json({ success: true, message: 'If an account with that email exists, a verification email has been sent.' });
    if (user.isVerified) return res.status(400).json({ success: false, message: 'This email is already verified.' });

    const { token: verificationToken, hashed, expires } = createVerificationToken();
    await prisma.user.update({ where: { id: user.id }, data: { emailVerificationToken: hashed, emailVerificationExpires: expires } });

    try {
      const content = emailVerificationEmail(user, verificationToken);
      const result = await sendEmail({ to: user.email, subject: content.subject, html: content.html, text: content.text });
      if (result?.skipped) {
        return res.status(200).json({ success: true, message: 'Email service is not configured. Please contact support.', skipped: true });
      }
    } catch (e) {
      return res.status(500).json({ success: false, message: 'Failed to send verification email.' });
    }

    res.status(200).json({ success: true, message: 'Verification email sent successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'An error occurred.' });
  }
});

// @route   POST /api/auth/google
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ success: false, message: 'Google credential is required' });

    const base64Url = credential.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      Buffer.from(base64, 'base64').toString().split('').map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    );
    const googleUser = JSON.parse(jsonPayload);

    if (!googleUser.email) return res.status(400).json({ success: false, message: 'Could not get email from Google account' });

    let user = await prisma.user.findUnique({ where: { email: googleUser.email } });

    if (user) {
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId: googleUser.sub, avatar: user.avatar || googleUser.picture, isVerified: true },
        });
      }
    } else {
      const nameParts = (googleUser.name || '').split(' ');
      user = await prisma.user.create({
        data: {
          email: googleUser.email,
          firstName: googleUser.given_name || nameParts[0] || 'User',
          lastName: googleUser.family_name || nameParts.slice(1).join(' ') || '',
          googleId: googleUser.sub,
          avatar: googleUser.picture,
          isVerified: true,
          password: await hashPassword(crypto.randomBytes(32).toString('hex')),
        },
      });
      try {
        const content = welcomeEmail(user);
        await sendEmail({ to: user.email, subject: content.subject, html: content.html, text: content.text });
      } catch (e) { console.error('Failed to send welcome email:', e); }
    }

    const token = generateToken(user.id);
    res.status(200).json({ success: true, message: 'Welcome!', data: { user: safeUser(user), token } });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ success: false, message: 'Google authentication failed' });
  }
});

// @route   POST /api/auth/facebook
router.post('/facebook', async (req, res) => {
  try {
    const { code, redirectUri } = req.body;
    if (!code) return res.status(400).json({ success: false, message: 'Facebook authorization code is required' });

    const facebookAppId = process.env.FACEBOOK_APP_ID;
    const facebookAppSecret = process.env.FACEBOOK_APP_SECRET;
    if (!facebookAppId || !facebookAppSecret) {
      return res.status(500).json({ success: false, message: 'Facebook OAuth is not configured on the server' });
    }

    const tokenResponse = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
      params: { client_id: facebookAppId, client_secret: facebookAppSecret, code, redirect_uri: redirectUri },
    });
    const accessToken = tokenResponse.data.access_token;

    const userResponse = await axios.get('https://graph.facebook.com/me', {
      params: { fields: 'id,name,email,picture', access_token: accessToken },
    });
    const facebookUser = userResponse.data;

    if (!facebookUser.email) {
      return res.status(400).json({ success: false, message: 'Could not get email from Facebook account.' });
    }

    let user = await prisma.user.findUnique({ where: { email: facebookUser.email } });

    if (user) {
      if (!user.facebookId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { facebookId: facebookUser.id, avatar: user.avatar || facebookUser.picture?.data?.url, isVerified: true },
        });
      }
    } else {
      const nameParts = (facebookUser.name || '').split(' ');
      user = await prisma.user.create({
        data: {
          email: facebookUser.email,
          firstName: nameParts[0] || 'User',
          lastName: nameParts.slice(1).join(' ') || '',
          facebookId: facebookUser.id,
          avatar: facebookUser.picture?.data?.url,
          isVerified: true,
          password: await hashPassword(crypto.randomBytes(32).toString('hex')),
        },
      });
      try {
        const content = welcomeEmail(user);
        await sendEmail({ to: user.email, subject: content.subject, html: content.html, text: content.text });
      } catch (e) { console.error('Failed to send welcome email:', e); }
    }

    const token = generateToken(user.id);
    res.status(200).json({ success: true, message: 'Welcome!', data: { user: safeUser(user), token } });
  } catch (error) {
    console.error('Facebook auth error:', error);
    res.status(500).json({ success: false, message: 'Facebook authentication failed' });
  }
});

// @route   POST /api/auth/apple
router.post('/apple', async (req, res) => {
  try {
    const { idToken, user: appleUserData } = req.body;
    if (!idToken) return res.status(400).json({ success: false, message: 'Apple authorization data is required' });

    const base64Url = idToken.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      Buffer.from(base64, 'base64').toString().split('').map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    );
    const appleUser = JSON.parse(jsonPayload);

    if (!appleUser.email) return res.status(400).json({ success: false, message: 'Could not get email from Apple account' });

    let user = await prisma.user.findUnique({ where: { email: appleUser.email } });

    if (user) {
      if (!user.appleId) {
        user = await prisma.user.update({ where: { id: user.id }, data: { appleId: appleUser.sub, isVerified: true } });
      }
    } else {
      let firstName = 'User';
      let lastName = '';
      if (appleUserData) {
        const userData = typeof appleUserData === 'string' ? JSON.parse(appleUserData) : appleUserData;
        firstName = userData.name?.firstName || 'User';
        lastName = userData.name?.lastName || '';
      }

      user = await prisma.user.create({
        data: {
          email: appleUser.email,
          firstName,
          lastName,
          appleId: appleUser.sub,
          isVerified: true,
          password: await hashPassword(crypto.randomBytes(32).toString('hex')),
        },
      });
      try {
        const content = welcomeEmail(user);
        await sendEmail({ to: user.email, subject: content.subject, html: content.html, text: content.text });
      } catch (e) { console.error('Failed to send welcome email:', e); }
    }

    const token = generateToken(user.id);
    res.status(200).json({ success: true, message: 'Welcome!', data: { user: safeUser(user), token } });
  } catch (error) {
    console.error('Apple auth error:', error);
    res.status(500).json({ success: false, message: 'Apple authentication failed' });
  }
});

// @route   PUT /api/auth/avatar
router.put('/avatar', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ success: false, message: 'Not authorized' });

    const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    const { avatar } = req.body;
    if (!avatar) return res.status(400).json({ success: false, message: 'Avatar image is required' });

    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const matches = avatar.match(/^data:(image\/[a-z]+);base64,/);
    if (!matches || !validImageTypes.includes(matches[1])) {
      return res.status(400).json({ success: false, message: 'Invalid image format. Please upload a JPEG, PNG, GIF, or WebP image.' });
    }

    const fileSizeInBytes = (avatar.replace(/^data:image\/[a-z]+;base64,/, '').length * 3) / 4;
    if (fileSizeInBytes > 2 * 1024 * 1024) {
      return res.status(400).json({ success: false, message: 'Image size must be less than 2MB' });
    }

    const user = await prisma.user.update({ where: { id: decoded.id }, data: { avatar } });
    res.status(200).json({ success: true, message: 'Avatar updated successfully', data: { avatar: user.avatar } });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ success: false, message: 'User not found' });
    res.status(500).json({ success: false, message: 'Failed to upload avatar' });
  }
});

// @route   DELETE /api/auth/avatar
router.delete('/avatar', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ success: false, message: 'Not authorized' });

    const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    await prisma.user.update({ where: { id: decoded.id }, data: { avatar: null } });
    res.status(200).json({ success: true, message: 'Avatar removed successfully' });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ success: false, message: 'User not found' });
    res.status(500).json({ success: false, message: 'Failed to remove avatar' });
  }
});

// @route   GET /api/auth/admin/users
router.get('/admin/users', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ success: false, message: 'Not authorized' });

    const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    const adminUser = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Admin privileges required.' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const role = req.query.role || '';
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 'asc' : 'desc';

    const where = {};
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (role) where.role = role;

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true, email: true, firstName: true, lastName: true,
          phone: true, avatar: true, role: true, isVerified: true,
          preferences: true, loyaltyPoints: true, createdAt: true, updatedAt: true,
        },
      }),
    ]);

    res.status(200).json({
      success: true,
      data: { users, pagination: { currentPage: page, totalPages: Math.ceil(total / limit), totalUsers: total, hasMore: page * limit < total } },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
});

// @route   GET /api/auth/admin/users/:id
router.get('/admin/users/:id', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ success: false, message: 'Not authorized' });

    const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    const adminUser = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Admin privileges required.' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true, email: true, firstName: true, lastName: true,
        phone: true, avatar: true, role: true, isVerified: true,
        preferences: true, loyaltyPoints: true, createdAt: true, updatedAt: true,
      },
    });

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch user' });
  }
});

// @route   PUT /api/auth/admin/users/:id/role
router.put('/admin/users/:id/role', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ success: false, message: 'Not authorized' });

    const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    const adminUser = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Admin privileges required.' });
    }

    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role. Must be "user" or "admin".' });
    }
    if (req.params.id === decoded.id && role !== 'admin') {
      return res.status(400).json({ success: false, message: 'You cannot change your own role.' });
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
      select: {
        id: true, email: true, firstName: true, lastName: true,
        phone: true, avatar: true, role: true, isVerified: true,
        preferences: true, loyaltyPoints: true, createdAt: true, updatedAt: true,
      },
    });

    res.status(200).json({ success: true, message: `User role updated to ${role}`, data: user });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ success: false, message: 'User not found' });
    res.status(500).json({ success: false, message: 'Failed to update user role' });
  }
});

// @route   DELETE /api/auth/admin/users/:id
router.delete('/admin/users/:id', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ success: false, message: 'Not authorized' });

    const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    const adminUser = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Admin privileges required.' });
    }
    if (req.params.id === decoded.id) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own account.' });
    }

    await prisma.user.delete({ where: { id: req.params.id } });
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ success: false, message: 'User not found' });
    res.status(500).json({ success: false, message: 'Failed to delete user' });
  }
});

// @route   POST /api/auth/magic-link
router.post('/magic-link', authLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(200).json({ success: true, message: 'If an account with that email exists, we sent a magic link to sign in.' });
    }

    const magicToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(magicToken).digest('hex');
    const magicLinkUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/auth/magic-link/${magicToken}`;

    await prisma.user.update({
      where: { id: user.id },
      data: { magicLinkToken: hashedToken, magicLinkExpires: new Date(Date.now() + 15 * 60 * 1000) },
    });

    try {
      await sendEmail({
        to: user.email,
        subject: 'Your Magic Link to Sign In - Nonsa Travels',
        html: `<!DOCTYPE html><html><body style="font-family:'Helvetica Neue',Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px;"><div style="background:linear-gradient(135deg,#0EA5E9 0%,#2563EB 100%);padding:30px;text-align:center;border-radius:10px 10px 0 0;"><h1 style="color:white;margin:0;font-size:28px;">Magic Link</h1></div><div style="background:#f9fafb;padding:30px;border-radius:0 0 10px 10px;"><p style="font-size:16px;">Hi ${user.firstName},</p><p style="font-size:16px;">Click below to sign in. This link expires in 15 minutes.</p><div style="text-align:center;margin:35px 0;"><a href="${magicLinkUrl}" style="display:inline-block;background:linear-gradient(135deg,#0EA5E9 0%,#2563EB 100%);color:white;padding:15px 40px;text-decoration:none;border-radius:8px;font-weight:bold;font-size:16px;">Sign In Now</a></div><p style="font-size:13px;color:#0EA5E9;word-break:break-all;background:white;padding:12px;border-radius:6px;border:1px solid #e5e7eb;">${magicLinkUrl}</p></div></body></html>`,
        text: `Hi ${user.firstName},\n\nClick to sign in:\n\n${magicLinkUrl}\n\nThis link expires in 15 minutes.\n\nNonsa Travels Team`,
      });
    } catch (e) {
      return res.status(500).json({ success: false, message: 'Failed to send magic link email' });
    }

    res.status(200).json({ success: true, message: 'Magic link sent! Check your email to sign in.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to send magic link' });
  }
});

// @route   GET /api/auth/magic-link/:token
router.get('/magic-link/:token', async (req, res) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await prisma.user.findFirst({
      where: { magicLinkToken: hashedToken, magicLinkExpires: { gt: new Date() } },
    });

    if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired magic link' });

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { magicLinkToken: null, magicLinkExpires: null, isVerified: true },
    });

    const jwtToken = generateToken(updated.id);
    res.status(200).json({ success: true, message: 'Successfully signed in!', data: { user: safeUser(updated), token: jwtToken } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to verify magic link' });
  }
});

export default router;
