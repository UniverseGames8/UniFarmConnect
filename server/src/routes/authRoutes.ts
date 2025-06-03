import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// POST /api/v2/auth/telegram - Аутентификация через Telegram
router.post('/telegram', authController.authenticateTelegram);

// GET /api/v2/auth/validate - Проверка валидности токена
router.get('/validate', authMiddleware, authController.validateToken);

// POST /api/v2/auth/refresh - Обновление токена
router.post('/refresh', authController.refreshToken);

// POST /api/v2/auth/logout - Выход из системы
router.post('/logout', authMiddleware, authController.logout);

// GET /api/v2/auth/session - Получение информации о текущей сессии
router.get('/session', authMiddleware, authController.getSessionInfo);

export default router; 