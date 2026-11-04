import mongoose from 'mongoose';

const communityMembershipSchema = new mongoose.Schema(
  {
    community: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Community',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['member', 'moderator', 'admin', 'owner'],
      default: 'member',
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

// Prevent duplicate memberships at database level
communityMembershipSchema.index({ community: 1, user: 1 }, { unique: true });

export const CommunityMembership = mongoose.model(
  'CommunityMembership',
  communityMembershipSchema
);
export default CommunityMembership;

