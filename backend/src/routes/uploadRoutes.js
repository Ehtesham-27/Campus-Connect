import { Router } from 'express';
import { uploadController } from '../controllers/upload.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { uploadSingleImage } from '../middleware/upload.js';

const router = Router();

// Student Profile Picture Upload (Requires authentication)
router.post(
  '/avatar',
  authenticate,
  uploadSingleImage('image'),
  uploadController.uploadAvatar
);

// Community Image Upload (Requires authentication & community ownership/admin check)
router.post(
  '/community/:id',
  authenticate,
  uploadSingleImage('image'),
  uploadController.uploadCommunityImage
);

export default router;

