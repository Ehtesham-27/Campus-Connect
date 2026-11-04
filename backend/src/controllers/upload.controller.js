import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Community } from '../models/Community.js';
import { uploadService } from '../services/upload.service.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ROLES } from '../constants/roles.js';

export const uploadController = {
  /**
   * Upload authenticated student's profile picture
   * POST /api/v1/upload/avatar
   */
  uploadAvatar: asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new ApiError(400, 'Please select an image file to upload.');
    }

    const imageUrl = await uploadService.uploadImage(req.file.buffer, 'avatars');

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { profileImage: imageUrl },
      { new: true }
    );

    if (!updatedUser) {
      throw new ApiError(404, 'User account not found.');
    }

    return new ApiResponse(
      200,
      {
        profileImage: imageUrl,
        user: updatedUser.toSafeObject(),
      },
      'Profile image uploaded successfully'
    ).send(res);
  }),

  /**
   * Upload community avatar or banner image
   * Restricted to community creator or administrator
   * POST /api/v1/upload/community/:id?type=avatar|banner
   */
  uploadCommunityImage: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const type = (req.query.type || 'avatar').toLowerCase() === 'banner' ? 'bannerImage' : 'avatarImage';

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, 'A valid community ID is required.');
    }

    if (!req.file) {
      throw new ApiError(400, 'Please select an image file to upload.');
    }

    const community = await Community.findById(id);
    if (!community) {
      throw new ApiError(404, 'Community not found.');
    }

    // Enforce ownership: only creator or admin can update community images
    const isOwner = String(community.creator) === String(req.user._id);
    const isAdmin = req.user.role === ROLES.ADMIN;

    if (!isOwner && !isAdmin) {
      throw new ApiError(403, 'Permission denied: Only the community creator or an administrator can modify community images.');
    }

    const imageUrl = await uploadService.uploadImage(req.file.buffer, 'communities');

    community[type] = imageUrl;
    await community.save();

    return new ApiResponse(
      200,
      {
        [type]: imageUrl,
        community,
      },
      `Community ${type === 'bannerImage' ? 'banner' : 'avatar'} updated successfully`
    ).send(res);
  }),
};

export default uploadController;

