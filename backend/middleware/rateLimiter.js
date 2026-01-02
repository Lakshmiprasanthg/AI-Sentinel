const rateLimit = require('express-rate-limit');

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000, // 1 minute
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 10,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter limiter for analysis endpoint
const analysisLimiter = rateLimit({
  windowMs: 60000, // 1 minute
  max: 3, // 3 requests per minute
  message: 'Analysis rate limit exceeded. Please wait before analyzing another document.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Authentication endpoint limiter (for login/register)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// OAuth endpoint limiter (more lenient for OAuth flows)
const oauthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 attempts
  message: 'Too many OAuth requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  apiLimiter,
  analysisLimiter,
  authLimiter,
  oauthLimiter,
};
