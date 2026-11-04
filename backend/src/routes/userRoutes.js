import { Router } from 'express';
import { userController } from '../controllers/user.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { validateUpdateProfileInput } from '../validators/auth.validator.js';

const router = Router();

// Retrieve authenticated user's own profile
router.get('/me', authenticate, userController.getMe);

// Update authenticated user's own profile
router.patch(
  '/me',
  authenticate,
  validate(validateUpdateProfileInput),
  userController.updateMe
);

export default router;
