import { Router } from 'express';
import { missionsController } from '../controllers/missionsController';

const router = Router();

// Получить активные миссии для пользователя
router.get('/:userId', missionsController.getActiveMissions);

// Завершить миссию
router.post('/:userId/complete', missionsController.completeMission);

// Получить награду за миссию
router.post('/:userId/claim', missionsController.claimReward);

// Получить прогресс миссий пользователя
router.get('/:userId/progress', missionsController.getMissionProgress);

export default router; 