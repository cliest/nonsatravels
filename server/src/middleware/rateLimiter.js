import rateLimit from 'express-rate-limit';

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Limit each IP to 500 requests per windowMs (increased for SPAs with many API calls)
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Strict limiter for authentication routes
export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 login attempts per hour
  message: {
    success: false,
    message: 'Too many login attempts, please try again after an hour.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limiter for contact/email routes
export const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 contact submissions per hour
  message: {
    success: false,
    message: 'Too many messages sent, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limiter for booking creation
export const bookingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // Limit each IP to 100 booking operations per hour
  message: {
    success: false,
    message: 'Too many booking attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limiter for avatar uploads — not credential-sensitive like authLimiter's targets,
// but still worth capping against storage-spam abuse of an authenticated session.
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 avatar changes per hour
  message: {
    success: false,
    message: 'Too many photo updates, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export default apiLimiter;
