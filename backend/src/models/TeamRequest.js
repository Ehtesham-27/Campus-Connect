import mongoose from 'mongoose';

export const TEAM_CATEGORIES = [
  'Hackathon',
  'Capstone',
  'Research',
  'Open Source',
  'Startup',
  'Course Project',
  'Other',
];

export const TEAM_STATUS = {
  OPEN: 'OPEN',
  FILLED: 'FILLED',
  CLOSED: 'CLOSED',
};

const teamRequestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Project or team title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    context: {
      type: String,
      trim: true,
      default: 'Campus Project / Hackathon',
      maxlength: [120, 'Context cannot exceed 120 characters'],
    },
    category: {
      type: String,
      enum: {
        values: TEAM_CATEGORIES,
        message: '{VALUE} is not a valid team category',
      },
      default: 'Hackathon',
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Project description is required'],
      trim: true,
      maxlength: [3000, 'Description cannot exceed 3000 characters'],
    },
    requiredSkills: {
      type: [String],
      default: [],
      index: true,
    },
    teamSize: {
      type: Number,
      default: 4,
      min: [2, 'Team size must be at least 2'],
      max: [20, 'Team size cannot exceed 20'],
    },
    openPositions: {
      type: Number,
      default: 2,
      min: [0, 'Open positions cannot be negative'],
      max: [20, 'Open positions cannot exceed 20'],
    },
    deadline: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: Object.values(TEAM_STATUS),
      default: TEAM_STATUS.OPEN,
      index: true,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator student ID is required'],
      index: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

teamRequestSchema.index({ status: 1, category: 1, createdAt: -1 });

export const TeamRequest = mongoose.model('TeamRequest', teamRequestSchema);
export default TeamRequest;
