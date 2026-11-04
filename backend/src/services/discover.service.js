import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { ROLES, USER_STATUS } from '../constants/roles.js';

export const discoverService = {
  /**
   * List and filter registered students excluding current user and sensitive data
   * @param {string} currentUserId
   * @param {Object} query
   */
  async getStudents(currentUserId, query = {}) {
    const filter = {
      _id: { $ne: currentUserId },
      status: USER_STATUS.ACTIVE,
      role: ROLES.STUDENT,
    };

    if (query.search && query.search.trim()) {
      const searchRegex = new RegExp(query.search.trim(), 'i');
      filter.$or = [
        { fullName: searchRegex },
        { branch: searchRegex },
        { course: searchRegex },
        { skills: searchRegex },
        { interests: searchRegex },
      ];
    }

    if (query.course && query.course.trim()) {
      filter.course = new RegExp(`^${query.course.trim()}$`, 'i');
    }

    if (query.branch && query.branch.trim()) {
      filter.branch = new RegExp(query.branch.trim(), 'i');
    }

    if (query.academicYear && query.academicYear.trim()) {
      filter.academicYear = new RegExp(query.academicYear.trim(), 'i');
    }

    if (query.skill && query.skill.trim()) {
      filter.skills = { $in: [new RegExp(`^${query.skill.trim()}$`, 'i')] };
    }

    if (query.interest && query.interest.trim()) {
      filter.interests = { $in: [new RegExp(`^${query.interest.trim()}$`, 'i')] };
    }

    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const [total, students] = await Promise.all([
      User.countDocuments(filter),
      User.find(filter)
        .select('fullName college course branch academicYear semester interests skills bio profileImage createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    const sanitized = students.map((s) => ({
      id: s._id.toString(),
      fullName: s.fullName,
      college: s.college,
      course: s.course,
      branch: s.branch || '',
      academicYear: s.academicYear || '',
      semester: s.semester || '',
      yearOrSemester: s.semester
        ? `${s.academicYear || ''}${s.academicYear && s.semester ? ' • ' : ''}Semester ${s.semester}`.trim()
        : (s.academicYear || ''),
      interests: s.interests || [],
      skills: s.skills || [],
      bio: s.bio || '',
      profileImage: s.profileImage || '',
      profileImageUrl: s.profileImage || '',
      createdAt: s.createdAt,
    }));

    return {
      students: sanitized,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  /**
   * Retrieve a single public student profile
   * @param {string} studentId
   */
  async getStudentById(studentId) {
    const student = await User.findOne({
      _id: studentId,
      status: USER_STATUS.ACTIVE,
    })
      .select('fullName college course branch academicYear semester interests skills bio profileImage createdAt')
      .lean();

    if (!student) {
      throw new ApiError(404, 'Student profile not found.');
    }

    return {
      id: student._id.toString(),
      fullName: student.fullName,
      college: student.college,
      course: student.course,
      branch: student.branch || '',
      academicYear: student.academicYear || '',
      semester: student.semester || '',
      yearOrSemester: student.semester
        ? `${student.academicYear || ''}${student.academicYear && student.semester ? ' • ' : ''}Semester ${student.semester}`.trim()
        : (student.academicYear || ''),
      interests: student.interests || [],
      skills: student.skills || [],
      bio: student.bio || '',
      profileImage: student.profileImage || '',
      profileImageUrl: student.profileImage || '',
      createdAt: student.createdAt,
    };
  },
};

export default discoverService;

