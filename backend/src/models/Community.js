import mongoose from 'mongoose';

export const COMMUNITY_CATEGORIES = [
  'Technical',
  'Cultural',
  'Sports',
  'Academic',
  'Social',
  'Literary',
  'Entrepreneurship',
  'Other',
];

export const ACCENT_COLORS = ['blue', 'orange', 'yellow', 'pink', 'purple'];

const communitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Community name is required'],
      trim: true,
      minlength: [2, 'Community name must be at least 2 characters'],
      maxlength: [100, 'Community name cannot exceed 100 characters'],
      unique: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Community description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: COMMUNITY_CATEGORIES,
        message: '{VALUE} is not a supported community category',
      },
      index: true,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    accentColor: {
      type: String,
      enum: ACCENT_COLORS,
      default: 'blue',
    },
    bannerImage: {
      type: String,
      default: '',
    },
    avatarImage: {
      type: String,
      default: '',
    },
    memberCount: {
      type: Number,
      default: 1,
      min: 0,
    },
    rules: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'PENDING_APPROVAL', 'SUSPENDED'],
      default: 'ACTIVE',
    },
  },
  {
    timestamps: true,
  }
);

export const Community = mongoose.model('Community', communitySchema);
export default Community;

