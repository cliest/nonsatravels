import express from 'express';
import { createServer } from 'http';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import connectDB from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import hotelRoutes from './routes/hotelRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import offerRoutes from './routes/offerRoutes.js';
import testimonialRoutes from './routes/testimonialRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import availabilityRoutes from './routes/availabilityRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import cannedResponseRoutes from './routes/cannedResponseRoutes.js';
import referralRoutes from './routes/referralRoutes.js';
import loyaltyRoutes from './routes/loyaltyRoutes.js';
import tripRoutes from './routes/tripRoutes.js';
import promoRoutes from './routes/promoRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import { startBookingScheduler } from './utils/bookingScheduler.js';
import { initializeSocket } from './utils/socketManager.js';
import logger from './utils/logger.js';
import { apiLimiter } from './middleware/rateLimiter.js';

// Load environment variables
dotenv.config({ override: true });

// Initialize express app
const app = express();
const httpServer = createServer(app);

// Trust proxy for Render/Vercel (required for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Connect to PostgreSQL via Prisma
connectDB();

// CORS - support multiple origins for development and production
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:4173', // Vite preview
  // Split CLIENT_URL on commas to support multiple URLs in one env var
  ...(process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : []),
  ...(process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : []),
].filter(Boolean).map(url => url.trim().replace(/\/$/, '')); // Trim whitespace and remove trailing slashes

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    const normalizedOrigin = origin.replace(/\/$/, '');

    if (normalizedOrigin.startsWith('http://localhost') || normalizedOrigin.startsWith('https://localhost')) {
      return callback(null, true);
    }
    if (allowedOrigins.includes(normalizedOrigin)) return callback(null, true);

    if (process.env.NODE_ENV === 'development' || !process.env.CLIENT_URL) {
      return callback(null, true);
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Set-Cookie'],
  optionsSuccessStatus: 200, // Some legacy browsers choke on 204
}));

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false, // Allow OAuth popups to communicate with parent window
}));

// Compression for better performance
app.use(compression());

// Rate limiting (after CORS)
app.use('/api', apiLimiter);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));


// Cache-Control middleware for public, slow-changing data
const publicCache = (seconds) => (req, res, next) => {
  if (req.method === 'GET') {
    res.set('Cache-Control', `public, max-age=${seconds}, stale-while-revalidate=${seconds * 2}`);
  }
  next();
};

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/hotels', publicCache(300), hotelRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/offers', publicCache(600), offerRoutes);
app.use('/api/testimonials', publicCache(600), testimonialRoutes);
app.use('/api/stats', publicCache(300), statsRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/canned-responses', cannedResponseRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/loyalty', loyaltyRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/promo', promoRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/payments', paymentRoutes);

// Health check route with detailed info
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cors: {
      allowedOrigins: allowedOrigins,
      clientUrl: process.env.CLIENT_URL,
      requestOrigin: req.get('origin') || req.get('referer') || 'none',
    }
  });
});

// 404 handler
app.use((req, res) => {
  logger.warn(`404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message}`, { stack: err.stack });
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  logger.info(`API available at http://localhost:${PORT}/api`);
  
  // Initialize Socket.IO
  initializeSocket(httpServer);
  
  // Start booking scheduler for check-in reminders
  startBookingScheduler();
});

export default app;
