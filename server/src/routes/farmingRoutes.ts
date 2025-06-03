import { Router } from 'express';
import { farmingController } from '../controllers/farmingController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Получение данных фарминга
router.get('/data', authMiddleware, farmingController.getFarmingData);

// Запуск фарминга
router.post('/start', authMiddleware, farmingController.startFarming);

// Сбор наград
router.post('/claim', authMiddleware, farmingController.claimFarming);

// Остановка фарминга
router.post('/stop', authMiddleware, farmingController.stopFarming);

export default router; 