import { ApiError } from '../utils/ApiError.js';

/**
 * Role-based Authorization Middleware
 * @param  {...string} allowedRoles - Array of permitted roles (e.g. 'admin', 'student')
 */
export const authorize = (...allowedRoles) => {
  const normalizedAllowed = allowedRoles.map((r) => String(r).toLowerCase());

  return (req, _res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required before checking permissions.'));
    }

    const userRole = String(req.user.role || '').toLowerCase();

    if (!normalizedAllowed.includes(userRole)) {
      return next(
        new ApiError(
          403,
          `Access forbidden. Required role: [${normalizedAllowed.join(', ')}]. Current role: ${userRole}.`
        )
      );
    }

    next();
  };
};

