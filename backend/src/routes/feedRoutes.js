import { Router } from 'express';
import { feedController } from '../controllers/feed.controller.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

router.use(authenticate);

router.get('/', feedController.getPosts);
router.post('/', feedController.createPost);
router.get('/:id', feedController.getPostById);
router.patch('/:id', feedController.updatePost);
router.delete('/:id', feedController.deletePost);

export default router;
