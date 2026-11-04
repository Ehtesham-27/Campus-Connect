import { userService } from '../services/user.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const userController = {
  /**
   * Get authenticated user's own profile
   */
  getMe: asyncHandler(async (req, res) => {
    const profile = await userService.getProfile(req.user._id);
    return new ApiResponse(200, profile, 'Profile retrieved successfully').send(res);
  }),

  /**
   * Update authenticated user's own profile
   */
  updateMe: asyncHandler(async (req, res) => {
    const profile = await userService.updateProfile(req.user._id, req.validated);
    return new ApiResponse(200, profile, 'Profile updated successfully').send(res);
  }),
};

export default userController;

