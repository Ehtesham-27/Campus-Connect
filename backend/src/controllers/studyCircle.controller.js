import { studyCircleService } from '../services/studyCircle.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const studyCircleController = {
  getStudyCircles: asyncHandler(async (req, res) => {
    const userId = req.user ? req.user._id : null;
    const result = await studyCircleService.getStudyCircles(req.query, userId);
    return new ApiResponse(200, result, 'Study circles retrieved successfully').send(res);
  }),

  getStudyCircleById: asyncHandler(async (req, res) => {
    const userId = req.user ? req.user._id : null;
    const result = await studyCircleService.getStudyCircleById(req.params.id, userId);
    return new ApiResponse(200, result, 'Study circle details retrieved successfully').send(res);
  }),

  createStudyCircle: asyncHandler(async (req, res) => {
    const result = await studyCircleService.createStudyCircle(req.user._id, req.body);
    return new ApiResponse(201, result, 'Study circle created successfully').send(res);
  }),

  updateStudyCircle: asyncHandler(async (req, res) => {
    const result = await studyCircleService.updateStudyCircle(
      req.params.id,
      req.user._id,
      req.user.role,
      req.body
    );
    return new ApiResponse(200, result, 'Study circle updated successfully').send(res);
  }),

  deleteStudyCircle: asyncHandler(async (req, res) => {
    await studyCircleService.deleteStudyCircle(req.params.id, req.user._id, req.user.role);
    return new ApiResponse(200, null, 'Study circle deleted successfully').send(res);
  }),

  joinStudyCircle: asyncHandler(async (req, res) => {
    const result = await studyCircleService.joinStudyCircle(req.params.id, req.user._id);
    return new ApiResponse(200, result, 'Joined study circle successfully').send(res);
  }),

  leaveStudyCircle: asyncHandler(async (req, res) => {
    const result = await studyCircleService.leaveStudyCircle(req.params.id, req.user._id);
    return new ApiResponse(200, result, 'Left study circle successfully').send(res);
  }),

  getStudyCircleMembers: asyncHandler(async (req, res) => {
    const result = await studyCircleService.getStudyCircleMembers(req.params.id);
    return new ApiResponse(200, result, 'Study circle members retrieved successfully').send(res);
  }),
};

export default studyCircleController;

