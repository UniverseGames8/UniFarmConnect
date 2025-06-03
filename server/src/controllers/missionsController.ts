import { Request, Response } from 'express';
import { MissionsService } from '../services/missionsService';

export const missionsController = {
  /**
   * Получить активные миссии для пользователя
   */
  async getActiveMissions(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId;
      console.log(`[MissionsController] Получение активных миссий для пользователя ${userId}`);
      
      const missions = await MissionsService.getActiveMissions(userId);
      
      res.json({
        success: true,
        data: missions
      });
    } catch (error) {
      console.error('[MissionsController] Ошибка получения миссий:', error);
      res.status(500).json({
        success: false,
        error: 'Ошибка получения активных миссий'
      });
    }
  },

  /**
   * Завершить миссию
   */
  async completeMission(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId;
      const { missionId } = req.body;
      
      console.log(`[MissionsController] Завершение миссии ${missionId} для пользователя ${userId}`);
      
      if (!missionId) {
        res.status(400).json({
          success: false,
          error: 'Не указан ID миссии'
        });
        return;
      }

      const result = await MissionsService.completeMission(userId, missionId);
      
      res.json({
        success: true,
        data: { completed: result }
      });
    } catch (error) {
      console.error('[MissionsController] Ошибка завершения миссии:', error);
      res.status(500).json({
        success: false,
        error: 'Ошибка завершения миссии'
      });
    }
  },

  /**
   * Получить награду за миссию
   */
  async claimReward(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId;
      const { missionId } = req.body;
      
      console.log(`[MissionsController] Получение награды за миссию ${missionId} для пользователя ${userId}`);
      
      if (!missionId) {
        res.status(400).json({
          success: false,
          error: 'Не указан ID миссии'
        });
        return;
      }

      const result = await MissionsService.claimMissionReward(userId, missionId);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('[MissionsController] Ошибка получения награды:', error);
      res.status(500).json({
        success: false,
        error: 'Ошибка получения награды за миссию'
      });
    }
  },

  /**
   * Получить прогресс миссий пользователя
   */
  async getMissionProgress(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId;
      console.log(`[MissionsController] Получение прогресса миссий для пользователя ${userId}`);
      
      const progress = await MissionsService.getMissionProgress(userId);
      
      res.json({
        success: true,
        data: progress
      });
    } catch (error) {
      console.error('[MissionsController] Ошибка получения прогресса миссий:', error);
      res.status(500).json({
        success: false,
        error: 'Ошибка получения прогресса миссий'
      });
    }
  }
}; 