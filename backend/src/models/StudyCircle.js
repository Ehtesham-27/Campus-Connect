import mongoose from 'mongoose';

export const STUDY_CIRCLE_LEVELS = [
  'Beginner',
  'Intermediate',
  'Advanced',
  'Core Exam Prep',
  'Interview Prep',
];

const studyCircleSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      minlength: [3, 'Subject must be at least 3 characters'],
      maxlength: [120, 'Subject cannot exceed 120 characters'],
      index: true,
    },
    topic: {
      type: String,
      required: [true, 'Focus topic is required'],
      trim: true,
      minlength: [3, 'Focus topic must be at least 3 characters'],
      maxlength: [150, 'Topic cannot exceed 150 characters'],
    },
    course: {
      type: String,
      trim: true,
      default: 'All Courses',
    },
    description: {
      type: String,
      required: [true, 'Description and learning goals are required'],
      trim: true,
      maxlength: [3000, 'Description cannot exceed 3000 characters'],
    },
    schedule: {
      type: String,
      trim: true,
      default: 'Flexible / As Scheduled',
      maxlength: [150, 'Schedule cannot exceed 150 characters'],
    },
    level: {
      type: String,
      enum: {
        values: STUDY_CIRCLE_LEVELS,
        message: '{VALUE} is not a valid study level',
      },
      default: 'Intermediate',
      index: true,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator ID is required'],
      index: true,
    },
    memberCount: {
      type: Number,
      default: 1,
      min: 0,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'ARCHIVED'],
      default: 'ACTIVE',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

studyCircleSchema.index({ status: 1, subject: 1, level: 1 });

export const StudyCircle = mongoose.model('StudyCircle', studyCircleSchema);
export default StudyCircle;

