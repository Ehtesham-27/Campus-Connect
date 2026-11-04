import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import {
  validateRegisterInput,
  validateLoginInput,
  validateForgotPasswordInput,
  validateResetPasswordInput,
} from '../validators/auth.validator.js';

const router = Router();

// Student Registration
router.post(
  '/register',
  authLimiter,
  validate(validateRegisterInput),
  authController.register
);

// User Authentication (Student & Admin)
router.post(
  '/login',
  authLimiter,
  validate(validateLoginInput),
  authController.login
);

// End Session
router.post('/logout', authController.logout);

// Current User Session
router.get('/me', authenticate, authController.getMe);

// Password Recovery Request
router.post(
  '/forgot-password',
  authLimiter,
  validate(validateForgotPasswordInput),
  authController.forgotPassword
);

// Password Recovery Confirmation
router.post(
  '/reset-password',
  authLimiter,
  validate(validateResetPasswordInput),
  authController.resetPassword
);

export default router;
