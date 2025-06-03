import { Router } from 'express';
import { walletController } from '../controllers/walletController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Получение данных кошелька
router.get('/data', authMiddleware, walletController.getWalletData);

// Получение истории транзакций
router.get('/transactions', authMiddleware, walletController.getTransactions);

// Вывод средств
router.post('/withdraw', authMiddleware, walletController.withdraw);

export default router; 