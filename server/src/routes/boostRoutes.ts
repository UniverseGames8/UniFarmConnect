import { Router } from 'express';
import { boostController } from '../controllers/boostController';

const router = Router();

// Получить список доступных бустов
router.get('/available', boostController.getAvailableBoosts);

// Получить активные бусты пользователя
router.get('/:userId/active', boostController.getUserBoosts);

// Активировать буст
router.post('/:userId/activate/:boostId', boostController.activateBoost);

// Деактивировать буст
router.post('/:userId/deactivate/:boostId', boostController.deactivateBoost);

// Получить статистику использования бустов
router.get('/:userId/stats', boostController.getBoostStats);

export default router; 