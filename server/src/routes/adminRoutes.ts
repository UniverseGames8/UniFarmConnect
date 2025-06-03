import { Router } from 'express';
import { adminController } from '../controllers/adminController';
import { adminAuthMiddleware } from '../middleware/adminAuth';

const router = Router();

// Применяем middleware аутентификации для админа
router.use(adminAuthMiddleware);

// Статистика системы
router.get('/stats', adminController.getSystemStats);

// Управление пользователями
router.get('/users', adminController.getUsers);
router.get('/users/:userId', adminController.getUserDetails);
router.patch('/users/:userId', adminController.updateUserSettings);

// Управление транзакциями
router.get('/transactions', adminController.getTransactions);
router.patch('/transactions/:transactionId', adminController.updateTransactionStatus);

export default router; 