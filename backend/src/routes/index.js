import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import authRoutes from './authRoutes.js';
import discoverRoutes from './discoverRoutes.js';
import communityRoutes from './communityRoutes.js';
import feedRoutes from './feedRoutes.js';
import opportunityRoutes from './opportunityRoutes.js';
import teamRoutes from './teamRoutes.js';
import studyCircleRoutes from './studyCircleRoutes.js';
import connectionRoutes from './connectionRoutes.js';
import userRoutes from './userRoutes.js';
import adminRoutes from './adminRoutes.js';
import uploadRoutes from './uploadRoutes.js';
import { adminController } from '../controllers/admin.controller.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

// Health check endpoint
router.use('/health', healthRoutes);

// Auth & Users
router.use('/auth', authRoutes);
router.use('/users', userRoutes);

// Core Modules (Phase 2 & 3)
router.use('/discover', discoverRoutes);
router.use('/communities', communityRoutes);
router.use('/feed', feedRoutes);
router.use('/opportunities', opportunityRoutes);
router.use('/teams', teamRoutes);
router.use('/study-circles', studyCircleRoutes);
router.use('/connections', connectionRoutes);

// Media uploads (Cloudinary)
router.use('/upload', uploadRoutes);

// Content reports (students can submit reports)
router.post('/reports', authenticate, adminController.createReport);

// Admin Moderation (Phase 3/4)
router.use('/admin', adminRoutes);

export default router;

