import mongoose from 'mongoose';

export const OPPORTUNITY_TYPES = [
  'Hackathon',
  'Internship',
  'Workshop',
  'Scholarship',
  'Competition',
];

const opportunitySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Opportunity title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    type: {
      type: String,
      required: [true, 'Opportunity type is required'],
      enum: {
        values: OPPORTUNITY_TYPES,
        message: '{VALUE} is not a valid opportunity type',
      },
      index: true,
    },
    organiser: {
      type: String,
      required: [true, 'Organiser name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [3000, 'Description cannot exceed 3000 characters'],
    },
    deadline: {
      type: Date,
      required: [true, 'Application deadline is required'],
      index: true,
    },
    eligibility: {
      type: String,
      required: [true, 'Eligibility criteria is required'],
      trim: true,
    },
    location: {
      type: String,
      default: 'Online / Campus',
      trim: true,
    },
    link: {
      type: String,
      default: '',
      trim: true,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['PENDING_VERIFICATION', 'VERIFIED', 'CLOSED', 'ARCHIVED'],
      default: 'VERIFIED',
      index: true,
    },
    accentColor: {
      type: String,
      enum: ['blue', 'orange', 'yellow', 'pink', 'purple'],
      default: 'blue',
    },
  },
  {
    timestamps: true,
  }
);

opportunitySchema.index({ deadline: 1, status: 1 });

export const Opportunity = mongoose.model('Opportunity', opportunitySchema);
export default Opportunity;

