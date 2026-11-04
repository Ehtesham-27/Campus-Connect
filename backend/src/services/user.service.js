import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';

export const userService = {
  /**
   * Get current authenticated user profile
   * @param {string} userId
   */
  async getProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User profile not found.');
    }
    return user.toSafeObject();
  },

  /**
   * Update student profile fields
   * @param {string} userId
   * @param {Object} updateData - Pre-validated sanitized profile data
   */
  async updateProfile(userId, updateData) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User profile not found.');
    }

    // Whitelist update fields explicitly to ensure sensitive attributes cannot be modified
    const allowedFields = [
      'fullName',
      'college',
      'course',
      'branch',
      'academicYear',
      'semester',
      'bio',
      'profileImage',
      'skills',
      'interests',
    ];

    allowedFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        user[field] = updateData[field];
      }
    });

    await user.save();

    return user.toSafeObject();
  },
};

export default userService;

