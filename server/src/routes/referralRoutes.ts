import { Router } from 'express';
import { referralController } from '../controllers/referralController';

const router = Router();

// Получить реферальную информацию пользователя
router.get('/:userId', referralController.getReferralInfo);

// Обработать реферальный код
router.post('/process', referralController.processReferralCode);

// Получить список рефералов пользователя
router.get('/:userId/referrals', referralController.getUserReferrals);

// Получить статистику доходов от рефералов
router.get('/:userId/earnings', referralController.getReferralEarnings);

// Валидировать реферальный код
router.get('/validate/:refCode', referralController.validateReferralCode);

export default router; 