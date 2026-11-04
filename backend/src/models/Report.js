import mongoose from 'mongoose';

export const REPORT_TARGETS = ['STUDENT', 'POST', 'COMMUNITY', 'OPPORTUNITY'];
export const REPORT_STATUS = ['PENDING', 'RESOLVED', 'DISMISSED'];

const reportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reporter student ID is required'],
      index: true,
    },
    targetType: {
      type: String,
      required: [true, 'Report target type is required'],
      enum: {
        values: REPORT_TARGETS,
        message: '{VALUE} is not a valid report target type',
      },
      index: true,
    },
    targetId: {
      type: String,
      required: [true, 'Report target ID is required'],
      index: true,
    },
    targetTitle: {
      type: String,
      trim: true,
      default: '',
    },
    reason: {
      type: String,
      required: [true, 'Report reason is required'],
      trim: true,
      maxlength: [200, 'Reason cannot exceed 200 characters'],
    },
    details: {
      type: String,
      trim: true,
      default: '',
      maxlength: [2000, 'Details cannot exceed 2000 characters'],
    },
    status: {
      type: String,
      enum: REPORT_STATUS,
      default: 'PENDING',
      index: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    resolutionNotes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

reportSchema.index({ status: 1, createdAt: -1 });

export const Report = mongoose.model('Report', reportSchema);
export default Report;

