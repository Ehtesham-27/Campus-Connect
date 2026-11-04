import { Router } from 'express';
import { discoverController } from '../controllers/discover.controller.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

// Student discovery is an authenticated feature
router.use(authenticate);

// Student directory list with search & multi-filter support
router.get('/students', discoverController.getStudents);
router.get('/', discoverController.getStudents);

// Student profile details
router.get('/students/:id', discoverController.getStudentById);

export default router;
