import { discoverService } from '../services/discover.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const discoverController = {
  /**
   * Search and filter registered students
   */
  getStudents: asyncHandler(async (req, res) => {
    const result = await discoverService.getStudents(req.user._id, req.query);
    return new ApiResponse(200, result, 'Students retrieved successfully').send(res);
  }),

  /**
   * View details of a specific student
   */
  getStudentById: asyncHandler(async (req, res) => {
    const student = await discoverService.getStudentById(req.params.id);
    return new ApiResponse(200, student, 'Student profile retrieved successfully').send(res);
  }),
};

export default discoverController;

