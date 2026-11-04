import mongoose from 'mongoose';

export const POST_CATEGORIES = [
  'ANNOUNCEMENT',
  'SOCIETY_UPDATE',
  'CAMPUS_EVENT',
  'GENERAL',
];

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Post title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    content: {
      type: String,
      required: [true, 'Post content is required'],
      trim: true,
      maxlength: [5000, 'Content cannot exceed 5000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Post category is required'],
      enum: {
        values: POST_CATEGORIES,
        message: '{VALUE} is not a valid post category',
      },
      index: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    community: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Community',
      default: null,
      index: true,
    },
    badgeVariant: {
      type: String,
      enum: ['yellow', 'orange', 'blue', 'pink', 'purple'],
      default: 'yellow',
    },
    status: {
      type: String,
      enum: ['PUBLISHED', 'FLAGGED', 'REMOVED'],
      default: 'PUBLISHED',
      index: true,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

postSchema.index({ createdAt: -1 });

export const Post = mongoose.model('Post', postSchema);
export default Post;

