import { Opportunity } from '../models/Opportunity.js';
import { ApiError } from '../utils/ApiError.js';
import { ROLES } from '../constants/roles.js';

export const opportunityService = {
  /**
   * Browse and filter campus opportunities
   */
  async getOpportunities(query = {}, userRole = 'student') {
    const filter = {};
    const isAdmin = String(userRole).toLowerCase() === ROLES.ADMIN;

    // Normal students only see VERIFIED or CLOSED listings unless admin
    if (!isAdmin) {
      filter.status = { $in: ['VERIFIED', 'CLOSED'] };
    } else if (query.status && query.status !== 'ALL') {
      filter.status = query.status.toUpperCase();
    }

    if (query.type && query.type.trim() && query.type !== 'ALL') {
      filter.type = query.type.trim();
    }

    if (query.search && query.search.trim()) {
      const searchRegex = new RegExp(query.search.trim(), 'i');
      filter.$or = [{ title: searchRegex }, { organiser: searchRegex }, { description: searchRegex }];
    }

    if (query.upcomingOnly === 'true') {
      filter.deadline = { $gte: new Date() };
    }

    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const [total, opportunities] = await Promise.all([
      Opportunity.countDocuments(filter),
      Opportunity.find(filter)
        .populate('creator', 'fullName role')
        .sort({ deadline: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    const items = opportunities.map((op) => ({
      id: op._id.toString(),
      title: op.title,
      type: op.type,
      organiser: op.organiser,
      description: op.description,
      deadline: op.deadline,
      eligibility: op.eligibility,
      location: op.location || 'Campus / Online',
      link: op.link || '',
      status: op.status,
      accentColor: op.accentColor || 'blue',
      creator: op.creator
        ? {
            id: op.creator._id.toString(),
            fullName: op.creator.fullName,
            role: op.creator.role,
          }
        : null,
      createdAt: op.createdAt,
    }));

    return {
      opportunities: items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  /**
   * Get single opportunity by ID
   */
  async getOpportunityById(opportunityId) {
    const opportunity = await Opportunity.findById(opportunityId)
      .populate('creator', 'fullName role')
      .lean();

    if (!opportunity) {
      throw new ApiError(404, 'Opportunity not found.');
    }

    return {
      id: opportunity._id.toString(),
      title: opportunity.title,
      type: opportunity.type,
      organiser: opportunity.organiser,
      description: opportunity.description,
      deadline: opportunity.deadline,
      eligibility: opportunity.eligibility,
      location: opportunity.location || 'Campus / Online',
      link: opportunity.link || '',
      status: opportunity.status,
      accentColor: opportunity.accentColor || 'blue',
      creator: opportunity.creator
        ? {
            id: opportunity.creator._id.toString(),
            fullName: opportunity.creator.fullName,
            role: opportunity.creator.role,
          }
        : null,
      createdAt: opportunity.createdAt,
    };
  },

  /**
   * Create an opportunity
   */
  async createOpportunity(userId, userRole, data) {
    const { title, type, organiser, description, deadline, eligibility, location, link, accentColor } = data;

    if (!title || title.trim().length < 3) {
      throw new ApiError(400, 'Title must be at least 3 characters.');
    }

    if (!deadline) {
      throw new ApiError(400, 'Application deadline is required.');
    }

    const isAdmin = String(userRole).toLowerCase() === ROLES.ADMIN;
    // Admin posts are immediately verified; student posts can be verified directly or pending
    const status = isAdmin ? 'VERIFIED' : 'VERIFIED';

    const defaultAccent =
      type === 'Hackathon'
        ? 'yellow'
        : type === 'Internship'
        ? 'blue'
        : type === 'Workshop'
        ? 'orange'
        : type === 'Scholarship'
        ? 'pink'
        : 'purple';

    const opportunity = await Opportunity.create({
      title: title.trim(),
      type,
      organiser: (organiser || 'Campus Organization').trim(),
      description: (description || '').trim(),
      deadline: new Date(deadline),
      eligibility: (eligibility || 'Open to all enrolled students').trim(),
      location: (location || 'Online / Campus').trim(),
      link: (link || '').trim(),
      creator: userId,
      status,
      accentColor: accentColor || defaultAccent,
    });

    return {
      id: opportunity._id.toString(),
      title: opportunity.title,
      type: opportunity.type,
      organiser: opportunity.organiser,
      deadline: opportunity.deadline,
      status: opportunity.status,
      createdAt: opportunity.createdAt,
    };
  },

  /**
   * Update opportunity (Creator or Admin)
   */
  async updateOpportunity(opportunityId, userId, userRole, data) {
    const opportunity = await Opportunity.findById(opportunityId);
    if (!opportunity) {
      throw new ApiError(404, 'Opportunity not found.');
    }

    const isCreator = opportunity.creator.toString() === userId.toString();
    const isAdmin = String(userRole).toLowerCase() === ROLES.ADMIN;

    if (!isCreator && !isAdmin) {
      throw new ApiError(403, 'Unauthorized. Only the opportunity creator or an administrator can edit this opportunity.');
    }

    if (data.title !== undefined) opportunity.title = data.title.trim();
    if (data.type !== undefined) opportunity.type = data.type;
    if (data.organiser !== undefined) opportunity.organiser = data.organiser.trim();
    if (data.description !== undefined) opportunity.description = data.description.trim();
    if (data.deadline !== undefined) opportunity.deadline = new Date(data.deadline);
    if (data.eligibility !== undefined) opportunity.eligibility = data.eligibility.trim();
    if (data.location !== undefined) opportunity.location = data.location.trim();
    if (data.link !== undefined) opportunity.link = data.link.trim();
    if (data.status !== undefined && isAdmin) opportunity.status = data.status.toUpperCase();

    await opportunity.save();

    return {
      id: opportunity._id.toString(),
      title: opportunity.title,
      type: opportunity.type,
      deadline: opportunity.deadline,
      status: opportunity.status,
    };
  },

  /**
   * Delete opportunity (Creator or Admin)
   */
  async deleteOpportunity(opportunityId, userId, userRole) {
    const opportunity = await Opportunity.findById(opportunityId);
    if (!opportunity) {
      throw new ApiError(404, 'Opportunity not found.');
    }

    const isCreator = opportunity.creator.toString() === userId.toString();
    const isAdmin = String(userRole).toLowerCase() === ROLES.ADMIN;

    if (!isCreator && !isAdmin) {
      throw new ApiError(403, 'Unauthorized. Only the opportunity creator or an administrator can delete this opportunity.');
    }

    await Opportunity.findByIdAndDelete(opportunityId);
    return { success: true };
  },

  /**
   * Admin verification endpoint
   */
  async verifyOpportunity(opportunityId, userRole) {
    const isAdmin = String(userRole).toLowerCase() === ROLES.ADMIN;
    if (!isAdmin) {
      throw new ApiError(403, 'Administrator privileges required to verify opportunities.');
    }

    const opportunity = await Opportunity.findByIdAndUpdate(
      opportunityId,
      { status: 'VERIFIED' },
      { new: true }
    );

    if (!opportunity) {
      throw new ApiError(404, 'Opportunity not found.');
    }

    return { id: opportunity._id.toString(), status: 'VERIFIED' };
  },
};

export default opportunityService;

