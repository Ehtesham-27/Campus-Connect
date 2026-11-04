import { opportunityService } from '../services/opportunity.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const opportunityController = {
  getOpportunities: asyncHandler(async (req, res) => {
    const userRole = req.user ? req.user.role : 'student';
    const result = await opportunityService.getOpportunities(req.query, userRole);
    return new ApiResponse(200, result, 'Opportunities retrieved successfully').send(res);
  }),

  getOpportunityById: asyncHandler(async (req, res) => {
    const opportunity = await opportunityService.getOpportunityById(req.params.id);
    return new ApiResponse(200, opportunity, 'Opportunity details retrieved successfully').send(res);
  }),

  createOpportunity: asyncHandler(async (req, res) => {
    const opportunity = await opportunityService.createOpportunity(
      req.user._id,
      req.user.role,
      req.body
    );
    return new ApiResponse(201, opportunity, 'Opportunity created successfully').send(res);
  }),

  updateOpportunity: asyncHandler(async (req, res) => {
    const updated = await opportunityService.updateOpportunity(
      req.params.id,
      req.user._id,
      req.user.role,
      req.body
    );
    return new ApiResponse(200, updated, 'Opportunity updated successfully').send(res);
  }),

  deleteOpportunity: asyncHandler(async (req, res) => {
    await opportunityService.deleteOpportunity(req.params.id, req.user._id, req.user.role);
    return new ApiResponse(200, null, 'Opportunity deleted successfully').send(res);
  }),

  verifyOpportunity: asyncHandler(async (req, res) => {
    const result = await opportunityService.verifyOpportunity(req.params.id, req.user.role);
    return new ApiResponse(200, result, 'Opportunity verified successfully').send(res);
  }),
};

export default opportunityController;

