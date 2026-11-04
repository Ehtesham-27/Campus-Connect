import mongoose from 'mongoose';
import { TeamRequest, TEAM_STATUS } from '../models/TeamRequest.js';
import { TeamApplication, APPLICATION_STATUS } from '../models/TeamApplication.js';
import { ApiError } from '../utils/ApiError.js';
import { ROLES } from '../constants/roles.js';

export const teamService = {
  /**
   * Browse and filter team requests
   */
  async getTeamRequests(query = {}, userId = null) {
    const filter = {};

    if (query.category && query.category.trim() && query.category !== 'ALL') {
      filter.category = query.category.trim();
    }

    if (query.status && query.status !== 'ALL') {
      filter.status = query.status.toUpperCase();
    } else if (!query.status) {
      filter.status = TEAM_STATUS.OPEN;
    }

    if (query.skill && query.skill.trim()) {
      filter.requiredSkills = { $in: [new RegExp(`^${query.skill.trim()}$`, 'i')] };
    }

    if (query.search && query.search.trim()) {
      const searchRegex = new RegExp(query.search.trim(), 'i');
      filter.$or = [
        { title: searchRegex },
        { context: searchRegex },
        { description: searchRegex },
        { requiredSkills: { $in: [searchRegex] } },
      ];
    }

    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const [total, teamDocs] = await Promise.all([
      TeamRequest.countDocuments(filter),
      TeamRequest.find(filter)
        .populate('creator', 'fullName college course academicYear avatarUrl')
        .populate('members', 'fullName course avatarUrl')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    // Check user applications if logged in
    let userAppliedMap = {};
    if (userId) {
      const teamIds = teamDocs.map((t) => t._id);
      const userApps = await TeamApplication.find({
        teamRequest: { $in: teamIds },
        applicant: userId,
      }).lean();

      userApps.forEach((app) => {
        userAppliedMap[app.teamRequest.toString()] = app.status;
      });
    }

    const items = teamDocs.map((t) => {
      const isCreator = userId ? String(t.creator?._id) === String(userId) : false;
      const myApplicationStatus = userAppliedMap[t._id.toString()] || null;

      return {
        id: t._id.toString(),
        title: t.title,
        context: t.context,
        category: t.category,
        description: t.description,
        requiredSkills: t.requiredSkills || [],
        teamSize: t.teamSize,
        openPositions: t.openPositions,
        deadline: t.deadline,
        status: t.status,
        creator: t.creator
          ? {
              id: t.creator._id.toString(),
              fullName: t.creator.fullName,
              college: t.creator.college,
              course: t.creator.course,
              academicYear: t.creator.academicYear,
              avatarUrl: t.creator.avatarUrl || '',
            }
          : null,
        memberCount: (t.members || []).length,
        isCreator,
        hasApplied: Boolean(myApplicationStatus),
        myApplicationStatus,
        createdAt: t.createdAt,
      };
    });

    return {
      teams: items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  /**
   * Get single team request by ID
   */
  async getTeamRequestById(teamId, userId = null, userRole = 'student') {
    if (!mongoose.Types.ObjectId.isValid(teamId)) {
      throw new ApiError(400, 'Invalid team request ID.');
    }

    const team = await TeamRequest.findById(teamId)
      .populate('creator', 'fullName college course branch academicYear avatarUrl bio skills')
      .populate('members', 'fullName college course branch academicYear avatarUrl')
      .lean();

    if (!team) {
      throw new ApiError(404, 'Team request not found.');
    }

    const isCreator = userId ? String(team.creator?._id) === String(userId) : false;
    const isAdmin = String(userRole).toLowerCase() === ROLES.ADMIN;

    // If owner or admin, include submitted applications
    let applications = [];
    if (isCreator || isAdmin) {
      const appDocs = await TeamApplication.find({ teamRequest: teamId })
        .populate('applicant', 'fullName college course branch academicYear avatarUrl skills bio')
        .sort({ createdAt: -1 })
        .lean();

      applications = appDocs.map((a) => ({
        id: a._id.toString(),
        message: a.message,
        skills: a.skills || [],
        status: a.status,
        applicant: a.applicant
          ? {
              id: a.applicant._id.toString(),
              fullName: a.applicant.fullName,
              college: a.applicant.college,
              course: a.applicant.course,
              branch: a.applicant.branch,
              academicYear: a.applicant.academicYear,
              avatarUrl: a.applicant.avatarUrl || '',
              skills: a.applicant.skills || [],
            }
          : null,
        createdAt: a.createdAt,
      }));
    }

    let myApplication = null;
    if (userId && !isCreator) {
      const userApp = await TeamApplication.findOne({
        teamRequest: teamId,
        applicant: userId,
      }).lean();

      if (userApp) {
        myApplication = {
          id: userApp._id.toString(),
          status: userApp.status,
          message: userApp.message,
          createdAt: userApp.createdAt,
        };
      }
    }

    return {
      id: team._id.toString(),
      title: team.title,
      context: team.context,
      category: team.category,
      description: team.description,
      requiredSkills: team.requiredSkills || [],
      teamSize: team.teamSize,
      openPositions: team.openPositions,
      deadline: team.deadline,
      status: team.status,
      creator: team.creator
        ? {
            id: team.creator._id.toString(),
            fullName: team.creator.fullName,
            college: team.creator.college,
            course: team.creator.course,
            branch: team.creator.branch,
            academicYear: team.creator.academicYear,
            avatarUrl: team.creator.avatarUrl || '',
            bio: team.creator.bio || '',
            skills: team.creator.skills || [],
          }
        : null,
      members: (team.members || []).map((m) => ({
        id: m._id.toString(),
        fullName: m.fullName,
        college: m.college,
        course: m.course,
        academicYear: m.academicYear,
        avatarUrl: m.avatarUrl || '',
      })),
      isCreator,
      applications,
      myApplication,
      createdAt: team.createdAt,
    };
  },

  /**
   * Create a team request
   */
  async createTeamRequest(userId, data) {
    const { title, context, category, description, requiredSkills, teamSize, openPositions, deadline } = data;

    if (!title || title.trim().length < 3) {
      throw new ApiError(400, 'Title must be at least 3 characters long.');
    }

    if (!description || description.trim().length < 10) {
      throw new ApiError(400, 'Description must be at least 10 characters long.');
    }

    const skillsArray = Array.isArray(requiredSkills)
      ? requiredSkills.map((s) => String(s).trim()).filter(Boolean)
      : typeof requiredSkills === 'string'
      ? requiredSkills.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    const parsedTeamSize = Math.max(2, Math.min(20, parseInt(teamSize, 10) || 4));
    const parsedOpenPositions = Math.max(1, Math.min(parsedTeamSize - 1, parseInt(openPositions, 10) || 2));

    const team = await TeamRequest.create({
      title: title.trim(),
      context: (context || 'Campus Project / Hackathon').trim(),
      category: category || 'Hackathon',
      description: description.trim(),
      requiredSkills: skillsArray,
      teamSize: parsedTeamSize,
      openPositions: parsedOpenPositions,
      deadline: deadline ? new Date(deadline) : null,
      creator: userId,
      members: [userId], // Creator is the first team member
      status: TEAM_STATUS.OPEN,
    });

    return {
      id: team._id.toString(),
      title: team.title,
      context: team.context,
      category: team.category,
      teamSize: team.teamSize,
      openPositions: team.openPositions,
      status: team.status,
      createdAt: team.createdAt,
    };
  },

  /**
   * Update team request (Owner or Admin)
   */
  async updateTeamRequest(teamId, userId, userRole, data) {
    if (!mongoose.Types.ObjectId.isValid(teamId)) {
      throw new ApiError(400, 'Invalid team request ID.');
    }

    const team = await TeamRequest.findById(teamId);
    if (!team) {
      throw new ApiError(404, 'Team request not found.');
    }

    const isCreator = String(team.creator) === String(userId);
    const isAdmin = String(userRole).toLowerCase() === ROLES.ADMIN;

    if (!isCreator && !isAdmin) {
      throw new ApiError(403, 'Unauthorized. Only the team creator or an administrator can update this request.');
    }

    if (data.title !== undefined) team.title = data.title.trim();
    if (data.context !== undefined) team.context = data.context.trim();
    if (data.category !== undefined) team.category = data.category;
    if (data.description !== undefined) team.description = data.description.trim();
    if (data.requiredSkills !== undefined) {
      team.requiredSkills = Array.isArray(data.requiredSkills)
        ? data.requiredSkills.map((s) => String(s).trim()).filter(Boolean)
        : typeof data.requiredSkills === 'string'
        ? data.requiredSkills.split(',').map((s) => s.trim()).filter(Boolean)
        : [];
    }
    if (data.teamSize !== undefined) team.teamSize = Math.max(2, parseInt(data.teamSize, 10));
    if (data.openPositions !== undefined) team.openPositions = Math.max(0, parseInt(data.openPositions, 10));
    if (data.deadline !== undefined) team.deadline = data.deadline ? new Date(data.deadline) : null;
    if (data.status !== undefined && Object.values(TEAM_STATUS).includes(data.status.toUpperCase())) {
      team.status = data.status.toUpperCase();
    }

    await team.save();

    return {
      id: team._id.toString(),
      title: team.title,
      status: team.status,
      openPositions: team.openPositions,
      updatedAt: team.updatedAt,
    };
  },

  /**
   * Delete team request (Owner or Admin)
   */
  async deleteTeamRequest(teamId, userId, userRole) {
    if (!mongoose.Types.ObjectId.isValid(teamId)) {
      throw new ApiError(400, 'Invalid team request ID.');
    }

    const team = await TeamRequest.findById(teamId);
    if (!team) {
      throw new ApiError(404, 'Team request not found.');
    }

    const isCreator = String(team.creator) === String(userId);
    const isAdmin = String(userRole).toLowerCase() === ROLES.ADMIN;

    if (!isCreator && !isAdmin) {
      throw new ApiError(403, 'Unauthorized. Only the team creator or an administrator can delete this request.');
    }

    await Promise.all([
      TeamRequest.findByIdAndDelete(teamId),
      TeamApplication.deleteMany({ teamRequest: teamId }),
    ]);

    return { success: true };
  },

  /**
   * Apply to join a team
   */
  async applyToTeam(teamId, applicantId, data = {}) {
    if (!mongoose.Types.ObjectId.isValid(teamId)) {
      throw new ApiError(400, 'Invalid team request ID.');
    }

    const team = await TeamRequest.findById(teamId);
    if (!team) {
      throw new ApiError(404, 'Team request not found.');
    }

    if (team.status !== TEAM_STATUS.OPEN) {
      throw new ApiError(400, `Cannot apply to this team because it is currently ${team.status.toLowerCase()}.`);
    }

    // Owner cannot apply to their own request
    if (String(team.creator) === String(applicantId)) {
      throw new ApiError(400, 'You are the creator of this team request.');
    }

    // Check if already a member
    if (team.members && team.members.some((m) => String(m) === String(applicantId))) {
      throw new ApiError(400, 'You are already an accepted member of this team.');
    }

    // Prevent duplicate application
    const existing = await TeamApplication.findOne({
      teamRequest: teamId,
      applicant: applicantId,
    });

    if (existing) {
      throw new ApiError(400, `You have already applied to this team (current status: ${existing.status}).`);
    }

    const skillsArray = Array.isArray(data.skills)
      ? data.skills.map((s) => String(s).trim()).filter(Boolean)
      : typeof data.skills === 'string'
      ? data.skills.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    const application = await TeamApplication.create({
      teamRequest: teamId,
      applicant: applicantId,
      message: (data.message || '').trim(),
      skills: skillsArray,
      status: APPLICATION_STATUS.PENDING,
    });

    return {
      id: application._id.toString(),
      teamRequest: teamId,
      status: application.status,
      message: application.message,
      createdAt: application.createdAt,
    };
  },

  /**
   * Get applications for a team request (Creator or Admin only)
   */
  async getTeamApplications(teamId, userId, userRole = 'student') {
    if (!mongoose.Types.ObjectId.isValid(teamId)) {
      throw new ApiError(400, 'Invalid team request ID.');
    }

    const team = await TeamRequest.findById(teamId);
    if (!team) {
      throw new ApiError(404, 'Team request not found.');
    }

    const isCreator = String(team.creator) === String(userId);
    const isAdmin = String(userRole).toLowerCase() === ROLES.ADMIN;

    if (!isCreator && !isAdmin) {
      throw new ApiError(403, 'Unauthorized. Only the team creator or an administrator can view join applications.');
    }

    const apps = await TeamApplication.find({ teamRequest: teamId })
      .populate('applicant', 'fullName college course branch academicYear avatarUrl skills bio')
      .sort({ createdAt: -1 })
      .lean();

    return apps.map((a) => ({
      id: a._id.toString(),
      message: a.message,
      skills: a.skills || [],
      status: a.status,
      applicant: a.applicant
        ? {
            id: a.applicant._id.toString(),
            fullName: a.applicant.fullName,
            college: a.applicant.college,
            course: a.applicant.course,
            branch: a.applicant.branch,
            academicYear: a.applicant.academicYear,
            avatarUrl: a.applicant.avatarUrl || '',
            skills: a.applicant.skills || [],
          }
        : null,
      createdAt: a.createdAt,
    }));
  },

  /**
   * Accept or Reject a team application
   */
  async updateApplicationStatus(applicationId, userId, userRole = 'student', newStatus) {
    if (!mongoose.Types.ObjectId.isValid(applicationId)) {
      throw new ApiError(400, 'Invalid application ID.');
    }

    const upperStatus = String(newStatus).toUpperCase();
    if (![APPLICATION_STATUS.ACCEPTED, APPLICATION_STATUS.REJECTED].includes(upperStatus)) {
      throw new ApiError(400, 'Invalid application status. Must be ACCEPTED or REJECTED.');
    }

    const application = await TeamApplication.findById(applicationId);
    if (!application) {
      throw new ApiError(404, 'Team application not found.');
    }

    const team = await TeamRequest.findById(application.teamRequest);
    if (!team) {
      throw new ApiError(404, 'Associated team request not found.');
    }

    const isCreator = String(team.creator) === String(userId);
    const isAdmin = String(userRole).toLowerCase() === ROLES.ADMIN;

    if (!isCreator && !isAdmin) {
      throw new ApiError(403, 'Unauthorized. Only the team creator or an administrator can decide on applications.');
    }

    if (upperStatus === APPLICATION_STATUS.ACCEPTED) {
      // Add applicant to members if not present
      if (!team.members.some((m) => String(m) === String(application.applicant))) {
        team.members.push(application.applicant);
        team.openPositions = Math.max(0, team.openPositions - 1);
        if (team.openPositions === 0) {
          team.status = TEAM_STATUS.FILLED;
        }
        await team.save();
      }
    }

    application.status = upperStatus;
    await application.save();

    return {
      id: application._id.toString(),
      status: application.status,
      updatedAt: application.updatedAt,
    };
  },

  /**
   * Get applications submitted by current user
   */
  async getMyApplications(userId) {
    const apps = await TeamApplication.find({ applicant: userId })
      .populate({
        path: 'teamRequest',
        select: 'title context category status creator teamSize openPositions',
        populate: { path: 'creator', select: 'fullName' },
      })
      .sort({ createdAt: -1 })
      .lean();

    return apps.map((a) => ({
      id: a._id.toString(),
      status: a.status,
      message: a.message,
      createdAt: a.createdAt,
      teamRequest: a.teamRequest
        ? {
            id: a.teamRequest._id.toString(),
            title: a.teamRequest.title,
            context: a.teamRequest.context,
            category: a.teamRequest.category,
            status: a.teamRequest.status,
            creatorName: a.teamRequest.creator?.fullName || 'Anonymous',
          }
        : null,
    }));
  },

  /**
   * Get team requests created by current user
   */
  async getMyTeamRequests(userId) {
    const teams = await TeamRequest.find({ creator: userId })
      .populate('members', 'fullName course avatarUrl')
      .sort({ createdAt: -1 })
      .lean();

    const teamIds = teams.map((t) => t._id);
    const applicationCounts = await TeamApplication.aggregate([
      { $match: { teamRequest: { $in: teamIds } } },
      { $group: { _id: '$teamRequest', total: { $sum: 1 }, pending: { $sum: { $cond: [{ $eq: ['$status', 'PENDING'] }, 1, 0] } } } },
    ]);

    const countMap = {};
    applicationCounts.forEach((c) => {
      countMap[c._id.toString()] = { total: c.total, pending: c.pending };
    });

    return teams.map((t) => ({
      id: t._id.toString(),
      title: t.title,
      context: t.context,
      category: t.category,
      status: t.status,
      openPositions: t.openPositions,
      teamSize: t.teamSize,
      memberCount: (t.members || []).length,
      applicationsTotal: countMap[t._id.toString()]?.total || 0,
      applicationsPending: countMap[t._id.toString()]?.pending || 0,
      createdAt: t.createdAt,
    }));
  },
};

export default teamService;

