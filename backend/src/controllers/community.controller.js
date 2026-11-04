import { communityService } from '../services/community.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const communityController = {
  getCommunities: asyncHandler(async (req, res) => {
    const userId = req.user ? req.user._id : null;
    const result = await communityService.getCommunities(userId, req.query);
    return new ApiResponse(200, result, 'Communities retrieved successfully').send(res);
  }),

  getCommunityById: asyncHandler(async (req, res) => {
    const userId = req.user ? req.user._id : null;
    const community = await communityService.getCommunityById(req.params.id, userId);
    return new ApiResponse(200, community, 'Community details retrieved successfully').send(res);
  }),

  createCommunity: asyncHandler(async (req, res) => {
    const community = await communityService.createCommunity(req.user._id, req.body);
    return new ApiResponse(201, community, 'Community created successfully').send(res);
  }),

  updateCommunity: asyncHandler(async (req, res) => {
    const updated = await communityService.updateCommunity(
      req.params.id,
      req.user._id,
      req.user.role,
      req.body
    );
    return new ApiResponse(200, updated, 'Community updated successfully').send(res);
  }),

  deleteCommunity: asyncHandler(async (req, res) => {
    await communityService.deleteCommunity(req.params.id, req.user._id, req.user.role);
    return new ApiResponse(200, null, 'Community deleted successfully').send(res);
  }),

  joinCommunity: asyncHandler(async (req, res) => {
    const result = await communityService.joinCommunity(req.params.id, req.user._id);
    return new ApiResponse(200, result, 'Joined community successfully').send(res);
  }),

  leaveCommunity: asyncHandler(async (req, res) => {
    const result = await communityService.leaveCommunity(req.params.id, req.user._id);
    return new ApiResponse(200, result, 'Left community successfully').send(res);
  }),

  getMembers: asyncHandler(async (req, res) => {
    const result = await communityService.getMembers(req.params.id, req.query);
    return new ApiResponse(200, result, 'Community members retrieved successfully').send(res);
  }),
};

export default communityController;

