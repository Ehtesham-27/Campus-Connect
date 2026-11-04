import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';

/**
 * Sign a JWT token for a user session
 * @param {Object} payload - Token payload (must include user id and role)
 * @returns {string} Signed JWT
 */
export const signToken = (payload) => {
  return jwt.sign(payload, ENV.JWT_SECRET, {
    expiresIn: ENV.JWT_EXPIRES_IN,
  });
};

/**
 * Verify and decode a JWT token
 * @param {string} token
 * @returns {Object} Decoded payload
 */
export const verifyToken = (token) => {
  return jwt.verify(token, ENV.JWT_SECRET);
};

/**
 * Standard cookie options helper to ensure setter and clearer match exactly
 * @param {number} maxAge - Cookie lifetime in ms
 */
export const getCookieOptions = (maxAge = 24 * 60 * 60 * 1000) => {
  const sameSite = ENV.COOKIE_SAMESITE;
  // Modern browsers mandate secure: true whenever sameSite is 'none'
  const secure = sameSite === 'none' ? true : ENV.COOKIE_SECURE;
  return {
    httpOnly: true,
    secure,
    sameSite,
    maxAge,
    path: '/',
  };
};

/**
 * Set the authentication JWT in a secure HttpOnly cookie
 * @param {import('express').Response} res
 * @param {string} token
 */
export const setAuthCookie = (res, token) => {
  res.cookie(ENV.COOKIE_NAME, token, getCookieOptions(24 * 60 * 60 * 1000));
};

/**
 * Clear the authentication cookie upon logout
 * Uses matching cookie options (path, httpOnly, secure, sameSite)
 * @param {import('express').Response} res
 */
export const clearAuthCookie = (res) => {
  const options = getCookieOptions(0);
  res.clearCookie(ENV.COOKIE_NAME, {
    httpOnly: options.httpOnly,
    secure: options.secure,
    sameSite: options.sameSite,
    path: options.path,
  });
};

/**
 * Extract token from either the HttpOnly cookie or the Authorization: Bearer header
 * @param {import('express').Request} req
 * @returns {string|null}
 */
export const extractToken = (req) => {
  if (req.cookies && req.cookies[ENV.COOKIE_NAME]) {
    return req.cookies[ENV.COOKIE_NAME];
  }

  const authHeader = req.headers?.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }

  return null;
};
