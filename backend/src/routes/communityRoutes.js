import { Router } from 'express';
import { communityController } from '../controllers/community.controller.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

// All community actions require student or admin authentication
router.use(authenticate);

// Listing & details
router.get('/', communityController.getCommunities);
router.post('/', communityController.createCommunity);
router.get('/:id', communityController.getCommunityById);
router.patch('/:id', communityController.updateCommunity);
router.delete('/:id', communityController.deleteCommunity);

// Membership actions
router.post('/:id/join', communityController.joinCommunity);
router.post('/:id/leave', communityController.leaveCommunity);
router.get('/:id/members', communityController.getMembers);

export default router;
