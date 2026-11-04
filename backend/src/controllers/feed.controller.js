import { feedService } from '../services/feed.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const feedController = {
  getPosts: asyncHandler(async (req, res) => {
    const result = await feedService.getPosts(req.query);
    return new ApiResponse(200, result, 'Campus feed posts retrieved successfully').send(res);
  }),

  getPostById: asyncHandler(async (req, res) => {
    const post = await feedService.getPostById(req.params.id);
    return new ApiResponse(200, post, 'Post retrieved successfully').send(res);
  }),

  createPost: asyncHandler(async (req, res) => {
    const post = await feedService.createPost(req.user._id, req.body);
    return new ApiResponse(201, post, 'Post published to campus feed successfully').send(res);
  }),

  updatePost: asyncHandler(async (req, res) => {
    const updated = await feedService.updatePost(
      req.params.id,
      req.user._id,
      req.user.role,
      req.body
    );
    return new ApiResponse(200, updated, 'Post updated successfully').send(res);
  }),

  deletePost: asyncHandler(async (req, res) => {
    await feedService.deletePost(req.params.id, req.user._id, req.user.role);
    return new ApiResponse(200, null, 'Post removed successfully').send(res);
  }),
};

export default feedController;

