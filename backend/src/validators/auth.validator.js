import { ApiError } from '../utils/ApiError.js';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate registration request body
 */
export const validateRegisterInput = (data = {}) => {
  const errors = [];
  const email = (data.email || data.collegeEmail || '').trim().toLowerCase();
  const fullName = (data.fullName || '').trim();
  const password = data.password || '';
  const confirmPassword = data.confirmPassword;
  const college = (data.college || '').trim();
  const course = (data.course || '').trim();
  const academicYear = (data.academicYear || data.yearOrSemester || '').trim();

  if (!fullName || fullName.length < 2) {
    errors.push('Full name is required and must be at least 2 characters.');
  }

  if (!email || !emailRegex.test(email)) {
    errors.push('A valid college email address is required.');
  }

  if (!password || password.length < 8) {
    errors.push('Password is required and must be at least 8 characters long.');
  }

  if (confirmPassword !== undefined && confirmPassword !== password) {
    errors.push('Passwords do not match.');
  }

  if (!college) {
    errors.push('College / University name is required.');
  }

  if (!course) {
    errors.push('Course / Degree is required.');
  }

  if (errors.length > 0) {
    throw new ApiError(400, 'Registration validation failed', errors);
  }

  return {
    fullName,
    email,
    password,
    college,
    course,
    branch: (data.branch || '').trim(),
    academicYear,
    semester: (data.semester || '').trim(),
  };
};

/**
 * Validate login request body
 */
export const validateLoginInput = (data = {}) => {
  const errors = [];
  const email = (data.email || data.collegeEmail || '').trim().toLowerCase();
  const password = data.password || '';

  if (!email || !emailRegex.test(email)) {
    errors.push('A valid college email address is required.');
  }

  if (!password) {
    errors.push('Password is required.');
  }

  if (errors.length > 0) {
    throw new ApiError(400, 'Login validation failed', errors);
  }

  return { email, password };
};

/**
 * Validate forgot password request body
 */
export const validateForgotPasswordInput = (data = {}) => {
  const email = (data.email || data.collegeEmail || '').trim().toLowerCase();

  if (!email || !emailRegex.test(email)) {
    throw new ApiError(400, 'A valid college email address is required');
  }

  return { email };
};

/**
 * Validate reset password request body
 */
export const validateResetPasswordInput = (data = {}) => {
  const errors = [];
  const token = (data.token || '').trim();
  const newPassword = data.newPassword || data.password || '';
  const confirmPassword = data.confirmPassword;

  if (!token) {
    errors.push('Password reset token is required.');
  }

  if (!newPassword || newPassword.length < 8) {
    errors.push('New password must be at least 8 characters long.');
  }

  if (confirmPassword !== undefined && confirmPassword !== newPassword) {
    errors.push('Passwords do not match.');
  }

  if (errors.length > 0) {
    throw new ApiError(400, 'Password reset validation failed', errors);
  }

  return { token, newPassword };
};

/**
 * Validate profile update payload
 */
export const validateUpdateProfileInput = (data = {}) => {
  const errors = [];
  const cleanData = {};

  if (data.fullName !== undefined) {
    const fullName = String(data.fullName).trim();
    if (fullName.length < 2) {
      errors.push('Full name must be at least 2 characters.');
    } else {
      cleanData.fullName = fullName;
    }
  }

  if (data.college !== undefined) {
    cleanData.college = String(data.college).trim();
  }

  if (data.course !== undefined) {
    cleanData.course = String(data.course).trim();
  }

  if (data.branch !== undefined) {
    cleanData.branch = String(data.branch).trim();
  }

  if (data.academicYear !== undefined || data.yearOrSemester !== undefined) {
    cleanData.academicYear = String(data.academicYear || data.yearOrSemester || '').trim();
  }

  if (data.semester !== undefined) {
    cleanData.semester = String(data.semester).trim();
  }

  if (data.bio !== undefined) {
    const bio = String(data.bio).trim();
    if (bio.length > 500) {
      errors.push('Bio cannot exceed 500 characters.');
    } else {
      cleanData.bio = bio;
    }
  }

  if (data.profileImage !== undefined || data.profileImageUrl !== undefined) {
    cleanData.profileImage = String(data.profileImage || data.profileImageUrl || '').trim();
  }

  if (data.skills !== undefined) {
    if (Array.isArray(data.skills)) {
      cleanData.skills = data.skills.map((s) => String(s).trim()).filter(Boolean);
    } else if (typeof data.skills === 'string') {
      cleanData.skills = data.skills.split(',').map((s) => s.trim()).filter(Boolean);
    }
  }

  if (data.interests !== undefined) {
    if (Array.isArray(data.interests)) {
      cleanData.interests = data.interests.map((i) => String(i).trim()).filter(Boolean);
    } else if (typeof data.interests === 'string') {
      cleanData.interests = data.interests.split(',').map((i) => i.trim()).filter(Boolean);
    }
  }

  if (errors.length > 0) {
    throw new ApiError(400, 'Profile validation failed', errors);
  }

  return cleanData;
};

