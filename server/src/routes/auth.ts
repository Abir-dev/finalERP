import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authenticateUser } from '../middleware/auth';

const router = Router();

router.post('/register', authController.register as any);
router.post('/login', authController.login as any);
router.get('/profile', authenticateUser as any, authController.getProfile as any);

export default router; 