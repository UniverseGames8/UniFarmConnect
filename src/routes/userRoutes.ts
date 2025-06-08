import { Router } from 'express';
import { login } from '../controllers/UserController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/login', login);

export const userRoutes = router; 