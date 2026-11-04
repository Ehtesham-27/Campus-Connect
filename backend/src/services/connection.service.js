import mongoose from 'mongoose';
import { ConnectionRequest, CONNECTION_STATUS } from '../models/Connection.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';

export const connectionService = {
  /**
   * Send a connection request to another student
   */
  async sendConnectionRequest(requesterId, recipientId, message = '') {
    if (!recipientId || !mongoose.Types.ObjectId.isValid(recipientId)) {
      throw new ApiError(400, 'A valid recipient student ID is required.');
    }

    if (String(requesterId) === String(recipientId)) {
      throw new ApiError(400, 'You cannot send a connection request to yourself.');
    }

    // Verify recipient exists and is active (using actual User schema field 'status')
    const recipient = await User.findById(recipientId).select('fullName status accountStatus');
    if (!recipient || recipient.status === 'SUSPENDED' || recipient.accountStatus === 'SUSPENDED') {
      throw new ApiError(404, 'Recipient student account not found or unavailable.');
    }

    // Check for existing connection/request between these two users
    const existing = await ConnectionRequest.findOne({
      $or: [
        { requester: requesterId, recipient: recipientId },
        { requester: recipientId, recipient: requesterId },
      ],
    });

    if (existing) {
      if (existing.status === CONNECTION_STATUS.ACCEPTED) {
        throw new ApiError(400, 'You are already connected with this student.');
      }

      if (existing.status === CONNECTION_STATUS.PENDING) {
        if (String(existing.requester) === String(requesterId)) {
          throw new ApiError(400, 'A pending connection request has already been sent to this student.');
        } else {
          throw new ApiError(400, 'This student has already sent you a connection request. Please accept their invitation.');
        }
      }

      if (existing.status === CONNECTION_STATUS.REJECTED) {
        // Allow re-initiating after a rejection
        existing.requester = requesterId;
        existing.recipient = recipientId;
        existing.status = CONNECTION_STATUS.PENDING;
        existing.message = (message || '').trim();
        await existing.save();

        return {
          id: existing._id.toString(),
          requester: requesterId.toString(),
          recipient: recipientId.toString(),
          status: existing.status,
          message: existing.message,
          createdAt: existing.updatedAt,
        };
      }
    }

    const request = await ConnectionRequest.create({
      requester: requesterId,
      recipient: recipientId,
      message: (message || '').trim(),
      status: CONNECTION_STATUS.PENDING,
    });

    return {
      id: request._id.toString(),
      requester: request.requester.toString(),
      recipient: request.recipient.toString(),
      status: request.status,
      message: request.message,
      createdAt: request.createdAt,
    };
  },

  /**
   * Get all accepted connections for the current user
   */
  async getAcceptedConnections(userId) {
    const records = await ConnectionRequest.find({
      $or: [{ requester: userId }, { recipient: userId }],
      status: CONNECTION_STATUS.ACCEPTED,
    })
      .populate('requester', 'fullName college course branch academicYear semester avatarUrl bio skills interests')
      .populate('recipient', 'fullName college course branch academicYear semester avatarUrl bio skills interests')
      .sort({ updatedAt: -1 })
      .lean();

    const connections = records.map((doc) => {
      const isRequester = String(doc.requester._id) === String(userId);
      const peer = isRequester ? doc.recipient : doc.requester;

      return {
        id: doc._id.toString(),
        connectedAt: doc.updatedAt,
        peer: {
          id: peer._id.toString(),
          fullName: peer.fullName,
          college: peer.college,
          course: peer.course,
          branch: peer.branch,
          academicYear: peer.academicYear,
          avatarUrl: peer.avatarUrl || '',
          bio: peer.bio || '',
          skills: peer.skills || [],
          interests: peer.interests || [],
        },
      };
    });

    return {
      connections,
      total: connections.length,
    };
  },

  /**
   * Get pending connection requests (both incoming and outgoing)
   */
  async getConnectionRequests(userId) {
    const [incomingDocs, outgoingDocs] = await Promise.all([
      ConnectionRequest.find({
        recipient: userId,
        status: CONNECTION_STATUS.PENDING,
      })
        .populate('requester', 'fullName college course branch academicYear avatarUrl bio skills')
        .sort({ createdAt: -1 })
        .lean(),
      ConnectionRequest.find({
        requester: userId,
        status: CONNECTION_STATUS.PENDING,
      })
        .populate('recipient', 'fullName college course branch academicYear avatarUrl bio skills')
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    const incoming = incomingDocs.map((doc) => ({
      id: doc._id.toString(),
      message: doc.message,
      createdAt: doc.createdAt,
      sender: {
        id: doc.requester._id.toString(),
        fullName: doc.requester.fullName,
        college: doc.requester.college,
        course: doc.requester.course,
        branch: doc.requester.branch,
        academicYear: doc.requester.academicYear,
        avatarUrl: doc.requester.avatarUrl || '',
        bio: doc.requester.bio || '',
        skills: doc.requester.skills || [],
      },
    }));

    const outgoing = outgoingDocs.map((doc) => ({
      id: doc._id.toString(),
      message: doc.message,
      createdAt: doc.createdAt,
      recipient: {
        id: doc.recipient._id.toString(),
        fullName: doc.recipient.fullName,
        college: doc.recipient.college,
        course: doc.recipient.course,
        branch: doc.recipient.branch,
        academicYear: doc.recipient.academicYear,
        avatarUrl: doc.recipient.avatarUrl || '',
        bio: doc.recipient.bio || '',
        skills: doc.recipient.skills || [],
      },
    }));

    return {
      incoming,
      outgoing,
      totalPending: incoming.length + outgoing.length,
    };
  },

  /**
   * Accept an incoming connection request
   */
  async acceptConnectionRequest(requestId, recipientId) {
    if (!requestId || !mongoose.Types.ObjectId.isValid(requestId)) {
      throw new ApiError(400, 'Invalid connection request ID.');
    }

    const request = await ConnectionRequest.findById(requestId);
    if (!request) {
      throw new ApiError(404, 'Connection request not found.');
    }

    if (String(request.recipient) !== String(recipientId)) {
      throw new ApiError(403, 'Unauthorized. Only the recipient student can accept this connection invitation.');
    }

    if (request.status === CONNECTION_STATUS.ACCEPTED) {
      throw new ApiError(400, 'Connection request has already been accepted.');
    }

    request.status = CONNECTION_STATUS.ACCEPTED;
    await request.save();

    return {
      id: request._id.toString(),
      status: request.status,
      updatedAt: request.updatedAt,
    };
  },

  /**
   * Reject an incoming connection request
   */
  async rejectConnectionRequest(requestId, recipientId) {
    if (!requestId || !mongoose.Types.ObjectId.isValid(requestId)) {
      throw new ApiError(400, 'Invalid connection request ID.');
    }

    const request = await ConnectionRequest.findById(requestId);
    if (!request) {
      throw new ApiError(404, 'Connection request not found.');
    }

    if (String(request.recipient) !== String(recipientId)) {
      throw new ApiError(403, 'Unauthorized. Only the recipient student can reject this connection invitation.');
    }

    request.status = CONNECTION_STATUS.REJECTED;
    await request.save();

    return {
      id: request._id.toString(),
      status: request.status,
    };
  },

  /**
   * Cancel a sent pending connection request
   */
  async cancelConnectionRequest(requestId, requesterId) {
    if (!requestId || !mongoose.Types.ObjectId.isValid(requestId)) {
      throw new ApiError(400, 'Invalid connection request ID.');
    }

    const request = await ConnectionRequest.findById(requestId);
    if (!request) {
      throw new ApiError(404, 'Connection request not found.');
    }

    if (String(request.requester) !== String(requesterId)) {
      throw new ApiError(403, 'Unauthorized. Only the requester can cancel this invitation.');
    }

    if (request.status !== CONNECTION_STATUS.PENDING) {
      throw new ApiError(400, 'Only pending connection requests can be cancelled.');
    }

    await ConnectionRequest.findByIdAndDelete(requestId);
    return { success: true };
  },

  /**
   * Remove an accepted connection
   */
  async removeConnection(connectionOrPeerId, userId) {
    if (!connectionOrPeerId || !mongoose.Types.ObjectId.isValid(connectionOrPeerId)) {
      throw new ApiError(400, 'Invalid connection or student ID.');
    }

    // Try finding by connection _id first or by peer user ID
    let connection = await ConnectionRequest.findOne({
      _id: connectionOrPeerId,
      $or: [{ requester: userId }, { recipient: userId }],
      status: CONNECTION_STATUS.ACCEPTED,
    });

    if (!connection) {
      // Try finding by peer user ID
      connection = await ConnectionRequest.findOne({
        $or: [
          { requester: userId, recipient: connectionOrPeerId },
          { requester: connectionOrPeerId, recipient: userId },
        ],
        status: CONNECTION_STATUS.ACCEPTED,
      });
    }

    if (!connection) {
      throw new ApiError(404, 'Active campus connection not found.');
    }

    await ConnectionRequest.findByIdAndDelete(connection._id);
    return { success: true };
  },

  /**
   * Helper: check connection status between two students
   */
  async getConnectionStatus(userId, targetUserId) {
    if (!targetUserId || !mongoose.Types.ObjectId.isValid(targetUserId)) {
      return { status: 'NONE' };
    }

    const record = await ConnectionRequest.findOne({
      $or: [
        { requester: userId, recipient: targetUserId },
        { requester: targetUserId, recipient: userId },
      ],
    }).lean();

    if (!record) {
      return { status: 'NONE' };
    }

    if (record.status === CONNECTION_STATUS.ACCEPTED) {
      return { status: 'CONNECTED', id: record._id.toString() };
    }

    if (record.status === CONNECTION_STATUS.PENDING) {
      if (String(record.requester) === String(userId)) {
        return { status: 'PENDING_SENT', id: record._id.toString() };
      } else {
        return { status: 'PENDING_RECEIVED', id: record._id.toString() };
      }
    }

    return { status: 'NONE' };
  },
};

export default connectionService;

