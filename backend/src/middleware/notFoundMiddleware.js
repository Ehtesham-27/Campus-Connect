import { ApiError } from '../utils/ApiError.js';

/**
 * 404 Route Not Found Middleware
 */
export function notFoundHandler(req, res, next) {
  const error = new ApiError(404, `Endpoint not found: ${req.method} ${req.originalUrl}`);
  next(error);
}

