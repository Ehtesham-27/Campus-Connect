import { Router } from 'express';
import { connectionController } from '../controllers/connection.controller.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

// All connection routes require authentication
router.use(authenticate);

// Get accepted connections
router.get('/', connectionController.getAcceptedConnections);

// Pending requests (incoming and outgoing)
router.get('/requests', connectionController.getConnectionRequests);
router.post('/requests', connectionController.sendConnectionRequest);
router.patch('/requests/:id/accept', connectionController.acceptConnectionRequest);
router.patch('/requests/:id/reject', connectionController.rejectConnectionRequest);
router.delete('/requests/:id', connectionController.cancelConnectionRequest);

// Check connection status with a specific user
router.get('/status/:targetUserId', connectionController.getConnectionStatus);

// Remove an accepted connection
router.delete('/:id', connectionController.removeConnection);

export default router;
