import { connectionService } from '../services/connection.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const connectionController = {
  getAcceptedConnections: asyncHandler(async (req, res) => {
    const result = await connectionService.getAcceptedConnections(req.user._id);
    return new ApiResponse(200, result, 'Connections retrieved successfully').send(res);
  }),

  getConnectionRequests: asyncHandler(async (req, res) => {
    const result = await connectionService.getConnectionRequests(req.user._id);
    return new ApiResponse(200, result, 'Connection requests retrieved successfully').send(res);
  }),

  sendConnectionRequest: asyncHandler(async (req, res) => {
    const recipientId = req.body.recipientId || req.body.recipient;
    const message = req.body.message || '';
    const result = await connectionService.sendConnectionRequest(req.user._id, recipientId, message);
    return new ApiResponse(201, result, 'Connection request sent successfully').send(res);
  }),

  acceptConnectionRequest: asyncHandler(async (req, res) => {
    const result = await connectionService.acceptConnectionRequest(req.params.id, req.user._id);
    return new ApiResponse(200, result, 'Connection request accepted').send(res);
  }),

  rejectConnectionRequest: asyncHandler(async (req, res) => {
    const result = await connectionService.rejectConnectionRequest(req.params.id, req.user._id);
    return new ApiResponse(200, result, 'Connection request rejected').send(res);
  }),

  cancelConnectionRequest: asyncHandler(async (req, res) => {
    const result = await connectionService.cancelConnectionRequest(req.params.id, req.user._id);
    return new ApiResponse(200, result, 'Connection request cancelled').send(res);
  }),

  removeConnection: asyncHandler(async (req, res) => {
    const result = await connectionService.removeConnection(req.params.id, req.user._id);
    return new ApiResponse(200, result, 'Connection removed successfully').send(res);
  }),

  getConnectionStatus: asyncHandler(async (req, res) => {
    const result = await connectionService.getConnectionStatus(req.user._id, req.params.targetUserId);
    return new ApiResponse(200, result, 'Connection status retrieved').send(res);
  }),
};

export default connectionController;

