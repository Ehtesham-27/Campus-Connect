import { adminService } from '../services/admin.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const adminController = {
  getDashboardOverview: asyncHandler(async (_req, res) => {
    const result = await adminService.getDashboardOverview();
    return new ApiResponse(200, result, 'Admin dashboard overview retrieved successfully').send(res);
  }),

  getStudents: asyncHandler(async (req, res) => {
    const result = await adminService.getStudents(req.query);
    return new ApiResponse(200, result, 'Students list retrieved successfully').send(res);
  }),

  updateStudentStatus: asyncHandler(async (req, res) => {
    const { status } = req.body;
    const result = await adminService.updateStudentStatus(req.params.id, req.user._id, status);
    return new ApiResponse(200, result, `Student account status updated to ${status}`).send(res);
  }),

  getCommunities: asyncHandler(async (req, res) => {
    const result = await adminService.getCommunities(req.query);
    return new ApiResponse(200, result, 'Communities list retrieved successfully').send(res);
  }),

  deleteCommunity: asyncHandler(async (req, res) => {
    await adminService.deleteCommunity(req.params.id);
    return new ApiResponse(200, null, 'Community deleted successfully by administrator').send(res);
  }),

  getPosts: asyncHandler(async (req, res) => {
    const result = await adminService.getPosts(req.query);
    return new ApiResponse(200, result, 'Feed posts retrieved successfully').send(res);
  }),

  deletePost: asyncHandler(async (req, res) => {
    await adminService.deletePost(req.params.id);
    return new ApiResponse(200, null, 'Post deleted successfully by administrator').send(res);
  }),

  togglePinPost: asyncHandler(async (req, res) => {
    const result = await adminService.togglePinPost(req.params.id);
    return new ApiResponse(200, result, 'Post pin status updated').send(res);
  }),

  getOpportunities: asyncHandler(async (req, res) => {
    const result = await adminService.getOpportunities(req.query);
    return new ApiResponse(200, result, 'Opportunities retrieved successfully').send(res);
  }),

  verifyOpportunity: asyncHandler(async (req, res) => {
    const result = await adminService.verifyOpportunity(req.params.id);
    return new ApiResponse(200, result, 'Opportunity verified successfully').send(res);
  }),

  deleteOpportunity: asyncHandler(async (req, res) => {
    await adminService.deleteOpportunity(req.params.id);
    return new ApiResponse(200, null, 'Opportunity deleted successfully by administrator').send(res);
  }),

  getReports: asyncHandler(async (req, res) => {
    const result = await adminService.getReports(req.query);
    return new ApiResponse(200, result, 'Moderation reports retrieved successfully').send(res);
  }),

  updateReport: asyncHandler(async (req, res) => {
    const result = await adminService.updateReport(req.params.id, req.user._id, req.body);
    return new ApiResponse(200, result, 'Moderation report status updated').send(res);
  }),

  createReport: asyncHandler(async (req, res) => {
    const result = await adminService.createReport(req.user._id, req.body);
    return new ApiResponse(201, result, 'Report submitted successfully for administrative review').send(res);
  }),
};

export default adminController;

