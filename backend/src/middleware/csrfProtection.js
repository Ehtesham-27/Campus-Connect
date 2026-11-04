import { ApiError } from '../utils/ApiError.js';
import { ENV } from '../config/env.js';

/**
 * CSRF Protection Middleware for Cookie-Authenticated Requests
 *
 * Verifies that mutating requests (POST, PATCH, PUT, DELETE) carrying an
 * authentication cookie originate from an approved, explicitly configured frontend origin.
 */
export const csrfProtection = (req, _res, next) => {
  // Safe idempotent HTTP methods do not mutate state
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Check if request is authenticated via the session cookie
  const isCookieAuthenticated = Boolean(req.cookies && req.cookies[ENV.COOKIE_NAME]);
  if (!isCookieAuthenticated) {
    // Requests not using cookies (e.g. unauthenticated public endpoints or Bearer token auth)
    // are not susceptible to browser ambient-credential CSRF
    return next();
  }

  // Derive allowed origins from configuration
  const allowedOrigins = [
    ENV.FRONTEND_URL,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ].filter(Boolean);

  const originHeader = req.headers.origin;
  const refererHeader = req.headers.referer;

  let requestOrigin = originHeader;
  if (!requestOrigin && refererHeader) {
    try {
      requestOrigin = new URL(refererHeader).origin;
    } catch {
      requestOrigin = null;
    }
  }

  // If a cross-origin header is present, it must be in the approved list
  if (requestOrigin) {
    if (!allowedOrigins.includes(requestOrigin)) {
      return next(
        new ApiError(403, `CSRF protection: request origin '${requestOrigin}' is not authorized.`)
      );
    }
  } else if (ENV.NODE_ENV === 'production') {
    // In production, require either Origin, Referer, or custom X-Requested-With header
    const hasCustomHeader = Boolean(req.headers['x-requested-with']);
    if (!hasCustomHeader) {
      return next(
        new ApiError(403, 'CSRF protection: missing origin verification on state-changing request.')
      );
    }
  }

  next();
};

