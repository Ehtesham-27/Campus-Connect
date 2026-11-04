import mongoose from 'mongoose';

const studyCircleMembershipSchema = new mongoose.Schema(
  {
    studyCircle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudyCircle',
      required: [true, 'Study Circle ID is required'],
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    role: {
      type: String,
      enum: ['MEMBER', 'MODERATOR', 'LEAD'],
      default: 'MEMBER',
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

studyCircleMembershipSchema.index({ studyCircle: 1, user: 1 }, { unique: true });

export const StudyCircleMembership = mongoose.model('StudyCircleMembership', studyCircleMembershipSchema);
export default StudyCircleMembership;
