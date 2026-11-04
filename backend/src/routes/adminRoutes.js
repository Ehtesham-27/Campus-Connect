import { Router } from 'express';
import { adminController } from '../controllers/admin.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

// Protect all admin endpoints with authentication and admin authorization
router.use(authenticate);
router.use(authorize(ROLES.ADMIN));

// 1. Dashboard Overview with real database metrics
router.get('/dashboard', adminController.getDashboardOverview);

// 2. Student Account Management
router.get('/students', adminController.getStudents);
router.patch('/students/:id/status', adminController.updateStudentStatus);

// 3. Community Moderation
router.get('/communities', adminController.getCommunities);
router.delete('/communities/:id', adminController.deleteCommunity);

// 4. Campus Feed Moderation
router.get('/feed', adminController.getPosts);
router.delete('/feed/:id', adminController.deletePost);
router.patch('/feed/:id/pin', adminController.togglePinPost);

// 5. Opportunity Verification & Management
router.get('/opportunities', adminController.getOpportunities);
router.patch('/opportunities/:id/verify', adminController.verifyOpportunity);
router.delete('/opportunities/:id', adminController.deleteOpportunity);

// 6. Reports Management
router.get('/reports', adminController.getReports);
router.patch('/reports/:id', adminController.updateReport);

export default router;
