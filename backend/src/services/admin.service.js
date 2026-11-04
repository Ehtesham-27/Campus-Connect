import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Community } from '../models/Community.js';
import { CommunityMembership } from '../models/CommunityMembership.js';
import { Post } from '../models/Post.js';
import { Opportunity } from '../models/Opportunity.js';
import { TeamRequest } from '../models/TeamRequest.js';
import { StudyCircle } from '../models/StudyCircle.js';
import { Report } from '../models/Report.js';
import { ApiError } from '../utils/ApiError.js';
import { ROLES } from '../constants/roles.js';

export const adminService = {
  /**
   * Platform Overview with real MongoDB metrics
   */
  async getDashboardOverview() {
    const [
      totalStudents,
      activeStudents,
      suspendedStudents,
      totalCommunities,
      totalPosts,
      totalOpportunities,
      pendingOpportunities,
      totalTeams,
      totalStudyCircles,
      totalReports,
      pendingReports,
      recentReports,
    ] = await Promise.all([
      User.countDocuments({ role: ROLES.STUDENT }),
      User.countDocuments({ role: ROLES.STUDENT, $or: [{ status: 'ACTIVE' }, { accountStatus: 'ACTIVE' }] }),
      User.countDocuments({ role: ROLES.STUDENT, $or: [{ status: 'SUSPENDED' }, { accountStatus: 'SUSPENDED' }] }),
      Community.countDocuments(),
      Post.countDocuments(),
      Opportunity.countDocuments(),
      Opportunity.countDocuments({ status: 'PENDING_VERIFICATION' }),
      TeamRequest.countDocuments(),
      StudyCircle.countDocuments(),
      Report.countDocuments(),
      Report.countDocuments({ status: 'PENDING' }),
      Report.find({ status: 'PENDING' })
        .populate('reporter', 'fullName collegeEmail')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    return {
      module: 'admin',
      stats: {
        totalStudents,
        activeStudents,
        suspendedStudents,
        totalCommunities,
        totalPosts,
        totalOpportunities,
        pendingOpportunities,
        totalTeams,
        totalStudyCircles,
        totalReports,
        pendingReports,
      },
      recentReports: recentReports.map((r) => ({
        id: r._id.toString(),
        targetType: r.targetType,
        targetTitle: r.targetTitle,
        reason: r.reason,
        reporter: r.reporter ? r.reporter.fullName : 'Anonymous',
        createdAt: r.createdAt,
      })),
    };
  },

  /**
   * List registered students for moderation
   */
  async getStudents(query = {}) {
    const filter = { role: ROLES.STUDENT };

    if (query.status && query.status !== 'ALL') {
      filter.$or = [{ status: query.status.toUpperCase() }, { accountStatus: query.status.toUpperCase() }];
    }

    if (query.search && query.search.trim()) {
      const searchRegex = new RegExp(query.search.trim(), 'i');
      filter.$or = [
        { fullName: searchRegex },
        { email: searchRegex },
        { college: searchRegex },
        { course: searchRegex },
        { branch: searchRegex },
      ];
    }

    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const [total, students] = await Promise.all([
      User.countDocuments(filter),
      User.find(filter)
        .select('-password -passwordResetToken -passwordResetExpires -verificationToken')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    return {
      students: students.map((s) => ({
        id: s._id.toString(),
        fullName: s.fullName,
        email: s.email,
        college: s.college,
        course: s.course,
        branch: s.branch || '',
        academicYear: s.academicYear || '',
        accountStatus: s.status || s.accountStatus || 'ACTIVE',
        role: s.role,
        createdAt: s.createdAt,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  /**
   * Update student account access status (ACTIVE / SUSPENDED)
   */
  async updateStudentStatus(studentId, adminUserId, status) {
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      throw new ApiError(400, 'Invalid student ID.');
    }

    const upperStatus = String(status).toUpperCase();
    if (!['ACTIVE', 'SUSPENDED'].includes(upperStatus)) {
      throw new ApiError(400, 'Status must be ACTIVE or SUSPENDED.');
    }

    if (String(studentId) === String(adminUserId)) {
      throw new ApiError(400, 'Administrators cannot alter their own account status.');
    }

    const student = await User.findById(studentId);
    if (!student) {
      throw new ApiError(404, 'Student account not found.');
    }

    if (student.role === ROLES.ADMIN) {
      throw new ApiError(403, 'Administrator accounts cannot be suspended via this endpoint.');
    }

    student.status = upperStatus;
    student.accountStatus = upperStatus;
    await student.save();

    return {
      id: student._id.toString(),
      accountStatus: student.status,
      fullName: student.fullName,
      email: student.email,
    };
  },

  /**
   * List communities for admin management
   */
  async getCommunities(query = {}) {
    const filter = {};
    if (query.search && query.search.trim()) {
      const searchRegex = new RegExp(query.search.trim(), 'i');
      filter.$or = [{ name: searchRegex }, { description: searchRegex }, { category: searchRegex }];
    }

    const communities = await Community.find(filter)
      .populate('creator', 'fullName email')
      .sort({ createdAt: -1 })
      .lean();

    return communities.map((c) => ({
      id: c._id.toString(),
      name: c.name,
      category: c.category,
      description: c.description,
      memberCount: c.memberCount,
      accentColor: c.accentColor,
      creator: c.creator ? { id: c.creator._id.toString(), fullName: c.creator.fullName, email: c.creator.email } : null,
      createdAt: c.createdAt,
    }));
  },

  /**
   * Delete community (Admin moderation)
   */
  async deleteCommunity(communityId) {
    if (!mongoose.Types.ObjectId.isValid(communityId)) {
      throw new ApiError(400, 'Invalid community ID.');
    }

    const community = await Community.findById(communityId);
    if (!community) {
      throw new ApiError(404, 'Community not found.');
    }

    await Promise.all([
      Community.findByIdAndDelete(communityId),
      CommunityMembership.deleteMany({ community: communityId }),
    ]);

    return { success: true };
  },

  /**
   * List campus feed posts for moderation
   */
  async getPosts(query = {}) {
    const filter = {};
    if (query.search && query.search.trim()) {
      const searchRegex = new RegExp(query.search.trim(), 'i');
      filter.$or = [{ title: searchRegex }, { content: searchRegex }];
    }

    const posts = await Post.find(filter)
      .populate('author', 'fullName email role')
      .sort({ createdAt: -1 })
      .lean();

    return posts.map((p) => ({
      id: p._id.toString(),
      title: p.title,
      content: p.content,
      category: p.category,
      isPinned: p.isPinned || false,
      status: p.status,
      author: p.author ? { id: p.author._id.toString(), fullName: p.author.fullName, email: p.author.email } : null,
      createdAt: p.createdAt,
    }));
  },

  /**
   * Delete post (Admin moderation)
   */
  async deletePost(postId) {
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      throw new ApiError(400, 'Invalid post ID.');
    }

    const post = await Post.findById(postId);
    if (!post) {
      throw new ApiError(404, 'Post not found.');
    }

    await Post.findByIdAndDelete(postId);
    return { success: true };
  },

  /**
   * Toggle post pin status
   */
  async togglePinPost(postId) {
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      throw new ApiError(400, 'Invalid post ID.');
    }

    const post = await Post.findById(postId);
    if (!post) {
      throw new ApiError(404, 'Post not found.');
    }

    post.isPinned = !post.isPinned;
    await post.save();

    return { id: post._id.toString(), isPinned: post.isPinned };
  },

  /**
   * List all opportunities for moderation
   */
  async getOpportunities(query = {}) {
    const filter = {};
    if (query.status && query.status !== 'ALL') {
      filter.status = query.status.toUpperCase();
    }

    const opps = await Opportunity.find(filter)
      .populate('creator', 'fullName email')
      .sort({ createdAt: -1 })
      .lean();

    return opps.map((o) => ({
      id: o._id.toString(),
      title: o.title,
      type: o.type,
      organiser: o.organiser,
      deadline: o.deadline,
      eligibility: o.eligibility,
      status: o.status,
      creator: o.creator ? { id: o.creator._id.toString(), fullName: o.creator.fullName, email: o.creator.email } : null,
      createdAt: o.createdAt,
    }));
  },

  /**
   * Verify opportunity listing
   */
  async verifyOpportunity(opportunityId) {
    if (!mongoose.Types.ObjectId.isValid(opportunityId)) {
      throw new ApiError(400, 'Invalid opportunity ID.');
    }

    const opp = await Opportunity.findByIdAndUpdate(
      opportunityId,
      { status: 'VERIFIED' },
      { new: true }
    );

    if (!opp) {
      throw new ApiError(404, 'Opportunity not found.');
    }

    return { id: opp._id.toString(), status: opp.status };
  },

  /**
   * Delete opportunity (Admin)
   */
  async deleteOpportunity(opportunityId) {
    if (!mongoose.Types.ObjectId.isValid(opportunityId)) {
      throw new ApiError(400, 'Invalid opportunity ID.');
    }

    const opp = await Opportunity.findById(opportunityId);
    if (!opp) {
      throw new ApiError(404, 'Opportunity not found.');
    }

    await Opportunity.findByIdAndDelete(opportunityId);
    return { success: true };
  },

  /**
   * List moderation reports
   */
  async getReports(query = {}) {
    const filter = {};
    if (query.status && query.status !== 'ALL') {
      filter.status = query.status.toUpperCase();
    }
    if (query.targetType && query.targetType !== 'ALL') {
      filter.targetType = query.targetType.toUpperCase();
    }

    const reports = await Report.find(filter)
      .populate('reporter', 'fullName email')
      .populate('reviewedBy', 'fullName email')
      .sort({ createdAt: -1 })
      .lean();

    return reports.map((r) => ({
      id: r._id.toString(),
      targetType: r.targetType,
      targetId: r.targetId,
      targetTitle: r.targetTitle,
      reason: r.reason,
      details: r.details,
      status: r.status,
      resolutionNotes: r.resolutionNotes,
      reporter: r.reporter ? { id: r.reporter._id.toString(), fullName: r.reporter.fullName, email: r.reporter.email } : null,
      reviewedBy: r.reviewedBy ? { id: r.reviewedBy._id.toString(), fullName: r.reviewedBy.fullName } : null,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
  },

  /**
   * Review/resolve a moderation report
   */
  async updateReport(reportId, adminUserId, data) {
    if (!mongoose.Types.ObjectId.isValid(reportId)) {
      throw new ApiError(400, 'Invalid report ID.');
    }

    const { status, resolutionNotes } = data;
    const upperStatus = String(status).toUpperCase();
    if (!['RESOLVED', 'DISMISSED'].includes(upperStatus)) {
      throw new ApiError(400, 'Report status must be RESOLVED or DISMISSED.');
    }

    const report = await Report.findById(reportId);
    if (!report) {
      throw new ApiError(404, 'Moderation report not found.');
    }

    report.status = upperStatus;
    report.reviewedBy = adminUserId;
    if (resolutionNotes) {
      report.resolutionNotes = resolutionNotes.trim();
    }

    await report.save();

    return {
      id: report._id.toString(),
      status: report.status,
      resolutionNotes: report.resolutionNotes,
      updatedAt: report.updatedAt,
    };
  },

  /**
   * Submit a content/account report (accessible by students)
   */
  async createReport(reporterId, data) {
    const { targetType, targetId, targetTitle, reason, details } = data;

    if (!targetType || !targetId || !reason) {
      throw new ApiError(400, 'Target type, target ID, and reason are required.');
    }

    const report = await Report.create({
      reporter: reporterId,
      targetType: targetType.toUpperCase(),
      targetId: String(targetId).trim(),
      targetTitle: (targetTitle || '').trim(),
      reason: reason.trim(),
      details: (details || '').trim(),
      status: 'PENDING',
    });

    return {
      id: report._id.toString(),
      targetType: report.targetType,
      reason: report.reason,
      status: report.status,
      createdAt: report.createdAt,
    };
  },
};

export default adminService;
