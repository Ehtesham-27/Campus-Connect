import { authService } from '../services/auth.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { setAuthCookie, clearAuthCookie } from '../utils/token.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const authController = {
  /**
   * Register a new student account
   */
  register: asyncHandler(async (req, res) => {
    const { user, token } = await authService.register(req.validated);
    setAuthCookie(res, token);
    return new ApiResponse(201, { user, token }, 'Account created successfully').send(res);
  }),

  /**
   * Authenticate student or admin
   */
  login: asyncHandler(async (req, res) => {
    const { user, token } = await authService.login(req.validated);
    setAuthCookie(res, token);
    return new ApiResponse(200, { user, token }, 'Signed in successfully').send(res);
  }),

  /**
   * Terminate current session
   */
  logout: asyncHandler(async (_req, res) => {
    clearAuthCookie(res);
    return new ApiResponse(200, null, 'Signed out successfully').send(res);
  }),

  /**
   * Retrieve current authenticated user session
   */
  getMe: asyncHandler(async (req, res) => {
    return new ApiResponse(200, req.user.toSafeObject(), 'Session verified').send(res);
  }),

  /**
   * Request password reset email
   */
  forgotPassword: asyncHandler(async (req, res) => {
    const result = await authService.forgotPassword(req.validated.email);
    return new ApiResponse(200, result, result.message).send(res);
  }),

  /**
   * Complete password reset with token
   */
  resetPassword: asyncHandler(async (req, res) => {
    const { user, token } = await authService.resetPassword(req.validated);
    setAuthCookie(res, token);
    return new ApiResponse(200, { user, token }, 'Password has been updated successfully').send(res);
  }),
};

export default authController;

