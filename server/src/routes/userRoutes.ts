import { Router } from 'express';
import { userController } from '../controllers/userController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Получение данных текущего пользователя
router.get('/me', authMiddleware, userController.getCurrentUser);

// Создание нового пользователя
router.post('/', userController.createUser);

// Обновление данных пользователя
router.patch('/me', authMiddleware, userController.updateUser);

// Генерация реферального кода
router.post('/ref-code', authMiddleware, userController.generateRefCode);

export default router; 