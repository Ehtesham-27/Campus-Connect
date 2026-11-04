/**
 * User Roles supported across Campus Connect
 * Source of truth: idea.md and frontend.md
 */
export const ROLES = Object.freeze({
  STUDENT: 'student',
  ADMIN: 'admin',
});

export const USER_STATUS = Object.freeze({
  ACTIVE: 'ACTIVE',
  PENDING_VERIFICATION: 'PENDING_VERIFICATION',
  SUSPENDED: 'SUSPENDED',
});

export const ALL_ROLES = [ROLES.STUDENT, ROLES.ADMIN];
export const ALL_STATUSES = [USER_STATUS.ACTIVE, USER_STATUS.PENDING_VERIFICATION, USER_STATUS.SUSPENDED];
