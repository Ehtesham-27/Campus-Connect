import { extractToken, verifyToken } from '../utils/token.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/User.js';
import { USER_STATUS } from '../constants/roles.js';

/**
 * Authentication Middleware
 * Validates HttpOnly cookie or Bearer JWT token and sets req.user
 */
export const authenticate = async (req, _res, next) => {
  try {
    const token = extractToken(req);

    if (!token) {
      throw new ApiError(401, 'Authentication required. Please log in to continue.');
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw new ApiError(401, 'Your session has expired. Please log in again.');
      }
      throw new ApiError(401, 'Invalid authentication token. Please log in again.');
    }

    if (!decoded || !decoded.id) {
      throw new ApiError(401, 'Invalid authentication payload.');
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      throw new ApiError(401, 'The account belonging to this token no longer exists.');
    }

    if (user.status === USER_STATUS.SUSPENDED) {
      throw new ApiError(403, 'Your account has been suspended. Please contact campus administrators.');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

