import { Router } from 'express';
import { opportunityController } from '../controllers/opportunity.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.use(authenticate);

router.get('/', opportunityController.getOpportunities);
router.post('/', opportunityController.createOpportunity);
router.get('/:id', opportunityController.getOpportunityById);
router.patch('/:id', opportunityController.updateOpportunity);
router.delete('/:id', opportunityController.deleteOpportunity);

// Admin-only verification route
router.patch('/:id/verify', authorize(ROLES.ADMIN), opportunityController.verifyOpportunity);

export default router;
