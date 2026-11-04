import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { ROLES, USER_STATUS, ALL_ROLES, ALL_STATUSES } from '../constants/roles.js';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Full name must be at least 2 characters long'],
      maxlength: [100, 'Full name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'College email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [emailRegex, 'Please provide a valid email address'],
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false,
    },
    college: {
      type: String,
      required: [true, 'College / University is required'],
      trim: true,
    },
    course: {
      type: String,
      required: [true, 'Course / Degree is required'],
      trim: true,
    },
    branch: {
      type: String,
      trim: true,
      default: '',
    },
    academicYear: {
      type: String,
      trim: true,
      default: '',
    },
    semester: {
      type: String,
      trim: true,
      default: '',
    },
    role: {
      type: String,
      enum: {
        values: ALL_ROLES,
        message: '{VALUE} is not a valid user role',
      },
      default: ROLES.STUDENT,
      lowercase: true,
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ALL_STATUSES,
        message: '{VALUE} is not a valid user status',
      },
      default: USER_STATUS.ACTIVE,
    },
    interests: {
      type: [String],
      default: [],
    },
    skills: {
      type: [String],
      default: [],
    },
    bio: {
      type: String,
      default: '',
      maxlength: [500, 'Bio cannot exceed 500 characters'],
    },
    profileImage: {
      type: String,
      default: '',
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving if modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare plaintext candidate password with hashed password
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) {
    return false;
  }
  return bcrypt.compare(candidatePassword, this.password);
};

// Generate unhashed reset token, hash it for storage, and set expiration (15 mins)
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  return resetToken;
};

// Safe presentation object excluding password and internal tokens
userSchema.methods.toSafeObject = function () {
  return {
    id: this._id ? this._id.toString() : undefined,
    fullName: this.fullName,
    email: this.email,
    role: this.role,
    status: this.status,
    college: this.college,
    course: this.course,
    branch: this.branch || '',
    academicYear: this.academicYear || '',
    semester: this.semester || '',
    yearOrSemester: this.semester
      ? `${this.academicYear || ''}${this.academicYear && this.semester ? ' • ' : ''}Semester ${this.semester}`.trim()
      : (this.academicYear || ''),
    interests: this.interests || [],
    skills: this.skills || [],
    bio: this.bio || '',
    profileImage: this.profileImage || '',
    profileImageUrl: this.profileImage || '',
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const User = mongoose.model('User', userSchema);
export default User;

