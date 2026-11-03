const rateLimit = require('express-rate-limit');

// Skip rate limiting in development
const isProduction = process.env.NODE_ENV === 'production';

// General: 10000 requests/15min in dev, 100 in production
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProduction ? 100 : 10000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later' }
});

// Auth: 1000 requests/15min in dev, 5 in production
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProduction ? 5 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many auth attempts, please try again later' }
});

// API: 10000 requests/15min in dev, 60 in production
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProduction ? 60 : 10000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many API requests, please try again later' }
});

module.exports = { generalLimiter, authLimiter, apiLimiter };
