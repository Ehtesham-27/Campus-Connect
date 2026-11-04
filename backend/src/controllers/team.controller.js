import { teamService } from '../services/team.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const teamController = {
  getTeamRequests: asyncHandler(async (req, res) => {
    const userId = req.user ? req.user._id : null;
    const result = await teamService.getTeamRequests(req.query, userId);
    return new ApiResponse(200, result, 'Team requests retrieved successfully').send(res);
  }),

  getTeamRequestById: asyncHandler(async (req, res) => {
    const userId = req.user ? req.user._id : null;
    const userRole = req.user ? req.user.role : 'student';
    const result = await teamService.getTeamRequestById(req.params.id, userId, userRole);
    return new ApiResponse(200, result, 'Team request details retrieved successfully').send(res);
  }),

  createTeamRequest: asyncHandler(async (req, res) => {
    const result = await teamService.createTeamRequest(req.user._id, req.body);
    return new ApiResponse(201, result, 'Team request created successfully').send(res);
  }),

  updateTeamRequest: asyncHandler(async (req, res) => {
    const result = await teamService.updateTeamRequest(
      req.params.id,
      req.user._id,
      req.user.role,
      req.body
    );
    return new ApiResponse(200, result, 'Team request updated successfully').send(res);
  }),

  deleteTeamRequest: asyncHandler(async (req, res) => {
    await teamService.deleteTeamRequest(req.params.id, req.user._id, req.user.role);
    return new ApiResponse(200, null, 'Team request deleted successfully').send(res);
  }),

  applyToTeam: asyncHandler(async (req, res) => {
    const result = await teamService.applyToTeam(req.params.id, req.user._id, req.body);
    return new ApiResponse(201, result, 'Application submitted successfully').send(res);
  }),

  getTeamApplications: asyncHandler(async (req, res) => {
    const result = await teamService.getTeamApplications(req.params.id, req.user._id, req.user.role);
    return new ApiResponse(200, result, 'Team applications retrieved successfully').send(res);
  }),

  updateApplicationStatus: asyncHandler(async (req, res) => {
    const { status } = req.body;
    const result = await teamService.updateApplicationStatus(
      req.params.applicationId,
      req.user._id,
      req.user.role,
      status
    );
    return new ApiResponse(200, result, `Application status updated to ${status}`).send(res);
  }),

  getMyApplications: asyncHandler(async (req, res) => {
    const result = await teamService.getMyApplications(req.user._id);
    return new ApiResponse(200, result, 'User applications retrieved successfully').send(res);
  }),

  getMyTeamRequests: asyncHandler(async (req, res) => {
    const result = await teamService.getMyTeamRequests(req.user._id);
    return new ApiResponse(200, result, 'User team requests retrieved successfully').send(res);
  }),
};

export default teamController;

