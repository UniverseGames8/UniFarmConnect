import express from 'express';
import { dailyBonusController } from '../controllers/dailyBonusController';

const router = express.Router();

// GET /api/v2/daily-bonus/:userId - Получить информацию о ежедневном бонусе
router.get('/:userId', dailyBonusController.getDailyBonusInfo);

// POST /api/v2/daily-bonus/claim - Забрать ежедневный бонус
router.post('/claim', dailyBonusController.claimDailyBonus);

// GET /api/v2/daily-bonus/:userId/calendar - Получить календарь бонусов
router.get('/:userId/calendar', dailyBonusController.getDailyBonusCalendar);

// GET /api/v2/daily-bonus/:userId/stats - Получить статистику бонусов
router.get('/:userId/stats', dailyBonusController.getDailyBonusStats);

// GET /api/v2/daily-bonus/:userId/availability - Проверить доступность бонуса
router.get('/:userId/availability', dailyBonusController.checkDailyBonusAvailability);

export default router; 