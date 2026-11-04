import { Router } from 'express';
import { teamController } from '../controllers/team.controller.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

// All team routes require authentication
router.use(authenticate);

// Specific routes before parameterized :id
router.get('/my/applications', teamController.getMyApplications);
router.get('/my/requests', teamController.getMyTeamRequests);
router.patch('/applications/:applicationId', teamController.updateApplicationStatus);

// Collection routes
router.get('/', teamController.getTeamRequests);
router.post('/', teamController.createTeamRequest);

// Parameterized item routes
router.get('/:id', teamController.getTeamRequestById);
router.patch('/:id', teamController.updateTeamRequest);
router.delete('/:id', teamController.deleteTeamRequest);

// Application actions
router.post('/:id/apply', teamController.applyToTeam);
router.get('/:id/applications', teamController.getTeamApplications);

export default router;
