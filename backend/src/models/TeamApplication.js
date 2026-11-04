import mongoose from 'mongoose';

export const APPLICATION_STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
};

const teamApplicationSchema = new mongoose.Schema(
  {
    teamRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TeamRequest',
      required: [true, 'Team request ID is required'],
      index: true,
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Applicant student ID is required'],
      index: true,
    },
    message: {
      type: String,
      trim: true,
      maxlength: [1000, 'Application message cannot exceed 1000 characters'],
      default: '',
    },
    skills: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: Object.values(APPLICATION_STATUS),
      default: APPLICATION_STATUS.PENDING,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

teamApplicationSchema.index({ teamRequest: 1, applicant: 1 }, { unique: true });
teamApplicationSchema.index({ applicant: 1, status: 1 });

export const TeamApplication = mongoose.model('TeamApplication', teamApplicationSchema);
export default TeamApplication;

