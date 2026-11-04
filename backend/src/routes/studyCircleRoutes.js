import { Router } from 'express';
import { studyCircleController } from '../controllers/studyCircle.controller.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

// All study circle routes require authentication
router.use(authenticate);

// Collection routes
router.get('/', studyCircleController.getStudyCircles);
router.post('/', studyCircleController.createStudyCircle);

// Parameterized item routes
router.get('/:id', studyCircleController.getStudyCircleById);
router.patch('/:id', studyCircleController.updateStudyCircle);
router.delete('/:id', studyCircleController.deleteStudyCircle);

// Membership actions
router.post('/:id/join', studyCircleController.joinStudyCircle);
router.post('/:id/leave', studyCircleController.leaveStudyCircle);
router.get('/:id/members', studyCircleController.getStudyCircleMembers);

export default router;
