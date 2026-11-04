import rateLimit from 'express-rate-limit';
import { ENV } from '../config/env.js';

/**
 * Rate limiter for sensitive authentication endpoints (login, forgot password, register)
 * Prevents brute force and denial of service attacks.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 requests per windowMs
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.',
  },
  skip: () => ENV.NODE_ENV === 'test', // Bypass in test environment
});

