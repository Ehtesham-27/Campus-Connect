import mongoose from 'mongoose';
import { StudyCircle, STUDY_CIRCLE_LEVELS } from '../models/StudyCircle.js';
import { StudyCircleMembership } from '../models/StudyCircleMembership.js';
import { ApiError } from '../utils/ApiError.js';
import { ROLES } from '../constants/roles.js';

export const studyCircleService = {
  /**
   * Browse and filter study circles
   */
  async getStudyCircles(query = {}, userId = null) {
    const filter = { status: 'ACTIVE' };

    if (query.level && query.level.trim() && query.level !== 'ALL') {
      filter.level = query.level.trim();
    }

    if (query.course && query.course.trim() && query.course !== 'ALL') {
      filter.course = new RegExp(query.course.trim(), 'i');
    }

    if (query.search && query.search.trim()) {
      const searchRegex = new RegExp(query.search.trim(), 'i');
      filter.$or = [
        { subject: searchRegex },
        { topic: searchRegex },
        { description: searchRegex },
        { schedule: searchRegex },
      ];
    }

    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const [total, circles] = await Promise.all([
      StudyCircle.countDocuments(filter),
      StudyCircle.find(filter)
        .populate('creator', 'fullName college course academicYear avatarUrl')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    // Check user memberships if logged in
    let userMemberships = new Set();
    if (userId) {
      const circleIds = circles.map((c) => c._id);
      const memberships = await StudyCircleMembership.find({
        studyCircle: { $in: circleIds },
        user: userId,
      }).lean();

      memberships.forEach((m) => {
        userMemberships.add(m.studyCircle.toString());
      });
    }

    const items = circles.map((c) => {
      const isCreator = userId ? String(c.creator?._id) === String(userId) : false;
      const isMember = userMemberships.has(c._id.toString());

      return {
        id: c._id.toString(),
        subject: c.subject,
        topic: c.topic,
        course: c.course,
        description: c.description,
        schedule: c.schedule,
        level: c.level,
        memberCount: c.memberCount,
        status: c.status,
        creator: c.creator
          ? {
              id: c.creator._id.toString(),
              fullName: c.creator.fullName,
              college: c.creator.college,
              course: c.creator.course,
              academicYear: c.creator.academicYear,
              avatarUrl: c.creator.avatarUrl || '',
            }
          : null,
        isCreator,
        isMember,
        createdAt: c.createdAt,
      };
    });

    return {
      circles: items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  /**
   * Get single study circle by ID
   */
  async getStudyCircleById(circleId, userId = null) {
    if (!mongoose.Types.ObjectId.isValid(circleId)) {
      throw new ApiError(400, 'Invalid study circle ID.');
    }

    const circle = await StudyCircle.findById(circleId)
      .populate('creator', 'fullName college course branch academicYear avatarUrl bio skills')
      .lean();

    if (!circle) {
      throw new ApiError(404, 'Study circle not found.');
    }

    let isMember = false;
    let memberRole = null;
    if (userId) {
      const membership = await StudyCircleMembership.findOne({
        studyCircle: circleId,
        user: userId,
      }).lean();

      if (membership) {
        isMember = true;
        memberRole = membership.role;
      }
    }

    const isCreator = userId ? String(circle.creator?._id) === String(userId) : false;

    return {
      id: circle._id.toString(),
      subject: circle.subject,
      topic: circle.topic,
      course: circle.course,
      description: circle.description,
      schedule: circle.schedule,
      level: circle.level,
      memberCount: circle.memberCount,
      status: circle.status,
      creator: circle.creator
        ? {
            id: circle.creator._id.toString(),
            fullName: circle.creator.fullName,
            college: circle.creator.college,
            course: circle.creator.course,
            branch: circle.creator.branch,
            academicYear: circle.creator.academicYear,
            avatarUrl: circle.creator.avatarUrl || '',
            bio: circle.creator.bio || '',
            skills: circle.creator.skills || [],
          }
        : null,
      isCreator,
      isMember,
      memberRole,
      createdAt: circle.createdAt,
    };
  },

  /**
   * Create a study circle
   */
  async createStudyCircle(userId, data) {
    const { subject, topic, course, description, schedule, level } = data;

    if (!subject || subject.trim().length < 3) {
      throw new ApiError(400, 'Subject must be at least 3 characters long.');
    }

    if (!topic || topic.trim().length < 3) {
      throw new ApiError(400, 'Focus topic must be at least 3 characters long.');
    }

    if (!description || description.trim().length < 10) {
      throw new ApiError(400, 'Description must be at least 10 characters long.');
    }

    const circle = await StudyCircle.create({
      subject: subject.trim(),
      topic: topic.trim(),
      course: (course || 'All Courses').trim(),
      description: description.trim(),
      schedule: (schedule || 'Flexible / As Scheduled').trim(),
      level: level || 'Intermediate',
      creator: userId,
      memberCount: 1, // Creator is first member
      status: 'ACTIVE',
    });

    // Create lead membership for creator
    await StudyCircleMembership.create({
      studyCircle: circle._id,
      user: userId,
      role: 'LEAD',
    });

    return {
      id: circle._id.toString(),
      subject: circle.subject,
      topic: circle.topic,
      level: circle.level,
      memberCount: circle.memberCount,
      status: circle.status,
      createdAt: circle.createdAt,
    };
  },

  /**
   * Update study circle (Creator or Admin)
   */
  async updateStudyCircle(circleId, userId, userRole, data) {
    if (!mongoose.Types.ObjectId.isValid(circleId)) {
      throw new ApiError(400, 'Invalid study circle ID.');
    }

    const circle = await StudyCircle.findById(circleId);
    if (!circle) {
      throw new ApiError(404, 'Study circle not found.');
    }

    const isCreator = String(circle.creator) === String(userId);
    const isAdmin = String(userRole).toLowerCase() === ROLES.ADMIN;

    if (!isCreator && !isAdmin) {
      throw new ApiError(403, 'Unauthorized. Only the study circle creator or an administrator can update this circle.');
    }

    if (data.subject !== undefined) circle.subject = data.subject.trim();
    if (data.topic !== undefined) circle.topic = data.topic.trim();
    if (data.course !== undefined) circle.course = data.course.trim();
    if (data.description !== undefined) circle.description = data.description.trim();
    if (data.schedule !== undefined) circle.schedule = data.schedule.trim();
    if (data.level !== undefined && STUDY_CIRCLE_LEVELS.includes(data.level)) {
      circle.level = data.level;
    }
    if (data.status !== undefined && ['ACTIVE', 'ARCHIVED'].includes(data.status.toUpperCase())) {
      circle.status = data.status.toUpperCase();
    }

    await circle.save();

    return {
      id: circle._id.toString(),
      subject: circle.subject,
      topic: circle.topic,
      level: circle.level,
      status: circle.status,
      updatedAt: circle.updatedAt,
    };
  },

  /**
   * Delete study circle (Creator or Admin)
   */
  async deleteStudyCircle(circleId, userId, userRole) {
    if (!mongoose.Types.ObjectId.isValid(circleId)) {
      throw new ApiError(400, 'Invalid study circle ID.');
    }

    const circle = await StudyCircle.findById(circleId);
    if (!circle) {
      throw new ApiError(404, 'Study circle not found.');
    }

    const isCreator = String(circle.creator) === String(userId);
    const isAdmin = String(userRole).toLowerCase() === ROLES.ADMIN;

    if (!isCreator && !isAdmin) {
      throw new ApiError(403, 'Unauthorized. Only the study circle creator or an administrator can delete this circle.');
    }

    await Promise.all([
      StudyCircle.findByIdAndDelete(circleId),
      StudyCircleMembership.deleteMany({ studyCircle: circleId }),
    ]);

    return { success: true };
  },

  /**
   * Join a study circle
   */
  async joinStudyCircle(circleId, userId) {
    if (!mongoose.Types.ObjectId.isValid(circleId)) {
      throw new ApiError(400, 'Invalid study circle ID.');
    }

    const circle = await StudyCircle.findById(circleId);
    if (!circle) {
      throw new ApiError(404, 'Study circle not found.');
    }

    if (circle.status !== 'ACTIVE') {
      throw new ApiError(400, 'Cannot join an archived study circle.');
    }

    // Check duplicate membership
    const existing = await StudyCircleMembership.findOne({
      studyCircle: circleId,
      user: userId,
    });

    if (existing) {
      throw new ApiError(409, 'You are already a member of this study circle.');
    }

    await StudyCircleMembership.create({
      studyCircle: circleId,
      user: userId,
      role: 'MEMBER',
    });

    const updated = await StudyCircle.findByIdAndUpdate(
      circleId,
      { $inc: { memberCount: 1 } },
      { new: true }
    );

    return {
      id: circleId,
      isMember: true,
      memberCount: updated ? updated.memberCount : circle.memberCount + 1,
    };
  },

  /**
   * Leave a study circle
   */
  async leaveStudyCircle(circleId, userId) {
    if (!mongoose.Types.ObjectId.isValid(circleId)) {
      throw new ApiError(400, 'Invalid study circle ID.');
    }

    const circle = await StudyCircle.findById(circleId);
    if (!circle) {
      throw new ApiError(404, 'Study circle not found.');
    }

    if (String(circle.creator) === String(userId)) {
      throw new ApiError(400, 'Circle creators cannot leave their own study circle. Delete the circle to disband it.');
    }

    const membership = await StudyCircleMembership.findOneAndDelete({
      studyCircle: circleId,
      user: userId,
    });

    if (!membership) {
      throw new ApiError(400, 'You are not a member of this study circle.');
    }

    const updated = await StudyCircle.findByIdAndUpdate(
      circleId,
      { $inc: { memberCount: -1 } },
      { new: true }
    );

    return {
      id: circleId,
      isMember: false,
      memberCount: Math.max(0, updated ? updated.memberCount : circle.memberCount - 1),
    };
  },

  /**
   * Get members of a study circle
   */
  async getStudyCircleMembers(circleId) {
    if (!mongoose.Types.ObjectId.isValid(circleId)) {
      throw new ApiError(400, 'Invalid study circle ID.');
    }

    const circle = await StudyCircle.findById(circleId);
    if (!circle) {
      throw new ApiError(404, 'Study circle not found.');
    }

    const memberships = await StudyCircleMembership.find({ studyCircle: circleId })
      .populate('user', 'fullName college course branch academicYear avatarUrl bio skills')
      .sort({ joinedAt: 1 })
      .lean();

    return memberships.map((m) => ({
      id: m._id.toString(),
      role: m.role,
      joinedAt: m.joinedAt,
      user: m.user
        ? {
            id: m.user._id.toString(),
            fullName: m.user.fullName,
            college: m.user.college,
            course: m.user.course,
            branch: m.user.branch,
            academicYear: m.user.academicYear,
            avatarUrl: m.user.avatarUrl || '',
            bio: m.user.bio || '',
            skills: m.user.skills || [],
          }
        : null,
    }));
  },
};

export default studyCircleService;

