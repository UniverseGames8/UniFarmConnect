import { Request, Response } from 'express';
import { BoostService } from '../services/boostService';

export const boostController = {
  /**
   * Получить список доступных бустов
   */
  async getAvailableBoosts(req: Request, res: Response): Promise<void> {
    try {
      console.log('[BoostController] Получение списка доступных бустов');
      
      const boosts = await BoostService.getAvailableBoosts();
      
      res.json({
        success: true,
        data: {
          boosts,
          total: boosts.length
        }
      });
    } catch (error) {
      console.error('[BoostController] Ошибка получения бустов:', error);
      res.status(500).json({
        success: false,
        error: 'Ошибка получения списка бустов'
      });
    }
  },

  /**
   * Получить активные бусты пользователя
   */
  async getUserBoosts(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId;
      console.log(`[BoostController] Получение активных бустов для пользователя ${userId}`);
      
      const activeBoosts = await BoostService.getUserBoosts(userId);
      
      res.json({
        success: true,
        data: {
          active_boosts: activeBoosts,
          total: activeBoosts.length
        }
      });
    } catch (error) {
      console.error('[BoostController] Ошибка получения активных бустов:', error);
      res.status(500).json({
        success: false,
        error: 'Ошибка получения активных бустов'
      });
    }
  },

  /**
   * Активировать буст
   */
  async activateBoost(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId;
      const { boostId } = req.body;
      
      console.log(`[BoostController] Активация буста ${boostId} для пользователя ${userId}`);
      
      if (!boostId) {
        res.status(400).json({
          success: false,
          error: 'Не указан ID буста'
        });
        return;
      }

      const result = await BoostService.activateBoost(userId, boostId);
      
      res.json({
        success: true,
        data: {
          boost: result,
          message: 'Буст успешно активирован'
        }
      });
    } catch (error) {
      console.error('[BoostController] Ошибка активации буста:', error);
      res.status(500).json({
        success: false,
        error: 'Ошибка активации буста'
      });
    }
  },

  /**
   * Деактивировать буст
   */
  async deactivateBoost(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId;
      const { boostId } = req.params;
      
      console.log(`[BoostController] Деактивация буста ${boostId} для пользователя ${userId}`);
      
      if (!boostId) {
        res.status(400).json({
          success: false,
          error: 'Не указан ID буста'
        });
        return;
      }

      await BoostService.deactivateBoost(userId, boostId);
      
      res.json({
        success: true,
        data: {
          message: 'Буст успешно деактивирован'
        }
      });
    } catch (error) {
      console.error('[BoostController] Ошибка деактивации буста:', error);
      res.status(500).json({
        success: false,
        error: 'Ошибка деактивации буста'
      });
    }
  },

  /**
   * Получить статистику использования бустов
   */
  async getBoostStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId;
      console.log(`[BoostController] Получение статистики бустов для пользователя ${userId}`);
      
      const stats = await BoostService.getBoostStats(userId);
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('[BoostController] Ошибка получения статистики бустов:', error);
      res.status(500).json({
        success: false,
        error: 'Ошибка получения статистики бустов'
      });
    }
  }
}; 