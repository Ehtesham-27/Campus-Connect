import { Community } from '../models/Community.js';
import { CommunityMembership } from '../models/CommunityMembership.js';
import { ApiError } from '../utils/ApiError.js';
import { ROLES } from '../constants/roles.js';

export const communityService = {
  /**
   * Browse and search communities
   */
  async getCommunities(userId, query = {}) {
    const filter = { status: 'ACTIVE' };

    if (query.search && query.search.trim()) {
      const searchRegex = new RegExp(query.search.trim(), 'i');
      filter.$or = [{ name: searchRegex }, { description: searchRegex }];
    }

    if (query.category && query.category.trim()) {
      filter.category = query.category.trim();
    }

    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const [total, communities] = await Promise.all([
      Community.countDocuments(filter),
      Community.find(filter)
        .populate('creator', 'fullName profileImage')
        .sort({ memberCount: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    // Check user membership status if authenticated
    let userMembershipIds = new Set();
    if (userId) {
      const memberships = await CommunityMembership.find({
        user: userId,
        community: { $in: communities.map((c) => c._id) },
      })
        .select('community')
        .lean();
      userMembershipIds = new Set(memberships.map((m) => m.community.toString()));
    }

    const items = communities.map((c) => ({
      id: c._id.toString(),
      name: c.name,
      description: c.description,
      category: c.category,
      accentColor: c.accentColor || 'blue',
      bannerImage: c.bannerImage || '',
      avatarImage: c.avatarImage || '',
      memberCount: c.memberCount || 0,
      rules: c.rules || [],
      creator: c.creator
        ? {
            id: c.creator._id.toString(),
            fullName: c.creator.fullName,
          }
        : null,
      isMember: userId ? userMembershipIds.has(c._id.toString()) : false,
      createdAt: c.createdAt,
    }));

    return {
      communities: items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  /**
   * Get single community details
   */
  async getCommunityById(communityId, userId) {
    const community = await Community.findById(communityId)
      .populate('creator', 'fullName profileImage email')
      .lean();

    if (!community) {
      throw new ApiError(404, 'Community not found.');
    }

    let membership = null;
    if (userId) {
      membership = await CommunityMembership.findOne({
        community: communityId,
        user: userId,
      }).lean();
    }

    return {
      id: community._id.toString(),
      name: community.name,
      description: community.description,
      category: community.category,
      accentColor: community.accentColor || 'blue',
      bannerImage: community.bannerImage || '',
      avatarImage: community.avatarImage || '',
      memberCount: community.memberCount || 0,
      rules: community.rules || [],
      creator: community.creator
        ? {
            id: community.creator._id.toString(),
            fullName: community.creator.fullName,
          }
        : null,
      isMember: Boolean(membership),
      userRole: membership ? membership.role : null,
      createdAt: community.createdAt,
    };
  },

  /**
   * Create a new community
   */
  async createCommunity(userId, data) {
    const { name, description, category, accentColor, rules } = data;

    const normalizedName = name.trim();
    const existing = await Community.findOne({
      name: new RegExp(`^${normalizedName}$`, 'i'),
    });

    if (existing) {
      throw new ApiError(409, 'A community with this name already exists.');
    }

    const community = await Community.create({
      name: normalizedName,
      description: description.trim(),
      category,
      accentColor: accentColor || 'blue',
      rules: Array.isArray(rules) ? rules : [],
      creator: userId,
      memberCount: 1,
    });

    // Automatically make creator the owner
    await CommunityMembership.create({
      community: community._id,
      user: userId,
      role: 'owner',
    });

    return {
      id: community._id.toString(),
      name: community.name,
      description: community.description,
      category: community.category,
      accentColor: community.accentColor,
      memberCount: community.memberCount,
      isMember: true,
      userRole: 'owner',
      createdAt: community.createdAt,
    };
  },

  /**
   * Update community details (Restricted to owner or admin)
   */
  async updateCommunity(communityId, userId, userRole, updateData) {
    const community = await Community.findById(communityId);
    if (!community) {
      throw new ApiError(404, 'Community not found.');
    }

    const isOwner = community.creator.toString() === userId.toString();
    const isAdmin = String(userRole).toLowerCase() === ROLES.ADMIN;

    if (!isOwner && !isAdmin) {
      throw new ApiError(403, 'Unauthorized. Only the community owner or an admin can edit this community.');
    }

    if (updateData.name && updateData.name.trim() !== community.name) {
      const duplicate = await Community.findOne({
        _id: { $ne: communityId },
        name: new RegExp(`^${updateData.name.trim()}$`, 'i'),
      });
      if (duplicate) {
        throw new ApiError(409, 'A community with this name already exists.');
      }
      community.name = updateData.name.trim();
    }

    if (updateData.description !== undefined) {
      community.description = updateData.description.trim();
    }
    if (updateData.category !== undefined) {
      community.category = updateData.category;
    }
    if (updateData.accentColor !== undefined) {
      community.accentColor = updateData.accentColor;
    }
    if (updateData.rules !== undefined) {
      community.rules = Array.isArray(updateData.rules) ? updateData.rules : [];
    }

    await community.save();

    return {
      id: community._id.toString(),
      name: community.name,
      description: community.description,
      category: community.category,
      accentColor: community.accentColor,
      memberCount: community.memberCount,
      rules: community.rules,
    };
  },

  /**
   * Delete community (Restricted to owner or admin)
   */
  async deleteCommunity(communityId, userId, userRole) {
    const community = await Community.findById(communityId);
    if (!community) {
      throw new ApiError(404, 'Community not found.');
    }

    const isOwner = community.creator.toString() === userId.toString();
    const isAdmin = String(userRole).toLowerCase() === ROLES.ADMIN;

    if (!isOwner && !isAdmin) {
      throw new ApiError(403, 'Unauthorized. Only the community owner or an admin can delete this community.');
    }

    await Promise.all([
      Community.findByIdAndDelete(communityId),
      CommunityMembership.deleteMany({ community: communityId }),
    ]);

    return { success: true };
  },

  /**
   * Join a community (Prevents duplicate memberships)
   */
  async joinCommunity(communityId, userId) {
    const community = await Community.findById(communityId);
    if (!community) {
      throw new ApiError(404, 'Community not found.');
    }

    const existingMembership = await CommunityMembership.findOne({
      community: communityId,
      user: userId,
    });

    if (existingMembership) {
      throw new ApiError(409, 'You are already a member of this community.');
    }

    await CommunityMembership.create({
      community: communityId,
      user: userId,
      role: 'member',
    });

    // Atomically increment memberCount
    await Community.findByIdAndUpdate(communityId, { $inc: { memberCount: 1 } });

    return {
      communityId,
      isMember: true,
      role: 'member',
    };
  },

  /**
   * Leave a community
   */
  async leaveCommunity(communityId, userId) {
    const community = await Community.findById(communityId);
    if (!community) {
      throw new ApiError(404, 'Community not found.');
    }

    const membership = await CommunityMembership.findOne({
      community: communityId,
      user: userId,
    });

    if (!membership) {
      throw new ApiError(400, 'You are not a member of this community.');
    }

    if (membership.role === 'owner') {
      throw new ApiError(
        400,
        'As the community owner, you cannot leave your community. Transfer ownership or delete the community.'
      );
    }

    await CommunityMembership.findByIdAndDelete(membership._id);
    await Community.findByIdAndUpdate(communityId, { $inc: { memberCount: -1 } });

    return {
      communityId,
      isMember: false,
    };
  },

  /**
   * View community members
   */
  async getMembers(communityId, query = {}) {
    const community = await Community.findById(communityId);
    if (!community) {
      throw new ApiError(404, 'Community not found.');
    }

    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const [total, memberships] = await Promise.all([
      CommunityMembership.countDocuments({ community: communityId }),
      CommunityMembership.find({ community: communityId })
        .populate('user', 'fullName college course branch academicYear profileImage')
        .sort({ role: 1, joinedAt: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    const members = memberships
      .filter((m) => m.user)
      .map((m) => ({
        id: m.user._id.toString(),
        fullName: m.user.fullName,
        college: m.user.college,
        course: m.user.course,
        branch: m.user.branch || '',
        academicYear: m.user.academicYear || '',
        profileImage: m.user.profileImage || '',
        membershipRole: m.role,
        joinedAt: m.joinedAt,
      }));

    return {
      members,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },
};

export default communityService;

