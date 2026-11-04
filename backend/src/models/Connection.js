import mongoose from 'mongoose';

export const CONNECTION_STATUS = Object.freeze({
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
});

const connectionSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Requester student ID is required'],
      index: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipient student ID is required'],
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: Object.values(CONNECTION_STATUS),
        message: '{VALUE} is not a valid connection status',
      },
      default: CONNECTION_STATUS.PENDING,
      index: true,
    },
    message: {
      type: String,
      maxlength: [300, 'Connection note cannot exceed 300 characters'],
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

connectionSchema.index({ requester: 1, recipient: 1 }, { unique: true });
connectionSchema.index({ recipient: 1, status: 1 });
connectionSchema.index({ requester: 1, status: 1 });

export const ConnectionRequest = mongoose.model('ConnectionRequest', connectionSchema);
export const Connection = ConnectionRequest;
export default ConnectionRequest;

