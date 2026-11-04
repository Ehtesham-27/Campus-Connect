import crypto from 'crypto';
import { User } from '../models/User.js';
import { ROLES, USER_STATUS } from '../constants/roles.js';
import { ApiError } from '../utils/ApiError.js';
import { signToken } from '../utils/token.js';
import { emailService } from './email.service.js';
import { ENV } from '../config/env.js';

export const authService = {
  /**
   * Register a new student account
   * Role is STRICTLY locked to 'student'.
   */
  async register(registrationData) {
    const { fullName, email, password, college, course, branch, academicYear, semester } = registrationData;

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      throw new ApiError(409, 'An account with this email address already exists.');
    }

    // Role MUST strictly be student regardless of any client inputs
    const user = await User.create({
      fullName,
      email: normalizedEmail,
      password,
      college,
      course,
      branch: branch || '',
      academicYear: academicYear || '',
      semester: semester || '',
      role: ROLES.STUDENT,
      status: USER_STATUS.ACTIVE,
    });

    const token = signToken({ id: user._id, role: user.role });

    return {
      user: user.toSafeObject(),
      token,
    };
  },

  /**
   * Authenticate a student or admin by email and password
   */
  async login({ email, password }) {
    const normalizedEmail = email.toLowerCase().trim();

    // Explicitly select password field which is hidden by default
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      throw new ApiError(401, 'Invalid college email or password.');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new ApiError(401, 'Invalid college email or password.');
    }

    if (user.status === USER_STATUS.SUSPENDED) {
      throw new ApiError(403, 'Your account is suspended. Please contact administrators.');
    }

    const token = signToken({ id: user._id, role: user.role });

    return {
      user: user.toSafeObject(),
      token,
    };
  },

  /**
   * Request password reset instructions
   */
  async forgotPassword(email) {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    // For security, always return success message to avoid account enumeration
    const safeResponse = {
      message: 'If an account exists for that email, a password reset link has been dispatched.',
    };

    if (!user) {
      return safeResponse;
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${ENV.PASSWORD_RESET_URL}?token=${resetToken}`;

    await emailService.sendPasswordResetEmail({
      to: user.email,
      resetToken,
      resetUrl,
    });

    // In test environment, expose the resetToken so integration tests can assert the full reset flow
    if (process.env.NODE_ENV === 'test' || ENV.NODE_ENV === 'test') {
      return {
        ...safeResponse,
        resetToken,
        resetUrl,
      };
    }

    return safeResponse;
  },

  /**
   * Reset password using a valid reset token
   */
  async resetPassword({ token, newPassword }) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    }).select('+password');

    if (!user) {
      throw new ApiError(400, 'Password reset token is invalid or has expired.');
    }

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    const authToken = signToken({ id: user._id, role: user.role });

    return {
      user: user.toSafeObject(),
      token: authToken,
    };
  },
};

export default authService;

