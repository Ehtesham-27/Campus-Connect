/**
 * Campus Connect Model Registry
 */
export { User } from './User.js';
export { Community } from './Community.js';
export { CommunityMembership } from './CommunityMembership.js';
export { Post } from './Post.js';
export { Opportunity } from './Opportunity.js';
export { Connection, ConnectionRequest } from './Connection.js';
export { TeamRequest } from './TeamRequest.js';
export { TeamApplication } from './TeamApplication.js';
export { StudyCircle } from './StudyCircle.js';
export { StudyCircleMembership } from './StudyCircleMembership.js';
export { Report } from './Report.js';

export const MODELS = Object.freeze({
  USER: 'User',
  COMMUNITY: 'Community',
  COMMUNITY_MEMBERSHIP: 'CommunityMembership',
  POST: 'Post',
  OPPORTUNITY: 'Opportunity',
  TEAM_REQUEST: 'TeamRequest',
  TEAM_APPLICATION: 'TeamApplication',
  STUDY_CIRCLE: 'StudyCircle',
  STUDY_CIRCLE_MEMBERSHIP: 'StudyCircleMembership',
  CONNECTION_REQUEST: 'ConnectionRequest',
  REPORT: 'Report',
});
