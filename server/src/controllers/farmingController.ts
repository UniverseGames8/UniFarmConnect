import { Request, Response } from 'express';
import { FarmingService } from '../services/farmingService';

export const farmingController = {
  /**
   * Получение данных фарминга пользователя
   */
  async getFarmingData(req: Request, res: Response): Promise<void> {
    try {
      console.log('[FarmingController] Получение данных фарминга');
      
      if (!req.user?.id) {
        res.status(401).json({
          success: false,
          error: 'Требуется авторизация'
        });
        return;
      }

      const farmingData = await FarmingService.getFarmingData(req.user.id);
      
      console.log('[FarmingController] Данные фарминга получены:', {
        user_id: req.user.id,
        farming_data: farmingData
      });

      res.json({
        success: true,
        data: farmingData
      });
    } catch (error) {
      console.error('[FarmingController] Ошибка получения данных фарминга:', error);
      res.status(500).json({
        success: false,
        error: 'Ошибка получения данных фарминга'
      });
    }
  },

  /**
   * Запуск фарминга
   */
  async startFarming(req: Request, res: Response): Promise<void> {
    try {
      console.log('[FarmingController] Запуск фарминга');
      
      if (!req.user?.id) {
        res.status(401).json({
          success: false,
          error: 'Требуется авторизация'
        });
        return;
      }

      const { amount } = req.body;
      
      if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
        res.status(400).json({
          success: false,
          error: 'Неверная сумма для фарминга'
        });
        return;
      }

      const result = await FarmingService.startFarming(req.user.id, amount);
      
      console.log('[FarmingController] Фарминг запущен:', {
        user_id: req.user.id,
        amount,
        result
      });

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('[FarmingController] Ошибка запуска фарминга:', error);
      res.status(500).json({
        success: false,
        error: 'Ошибка запуска фарминга'
      });
    }
  },

  /**
   * Сбор наград фарминга
   */
  async claimFarming(req: Request, res: Response): Promise<void> {
    try {
      console.log('[FarmingController] Сбор наград фарминга');
      
      if (!req.user?.id) {
        res.status(401).json({
          success: false,
          error: 'Требуется авторизация'
        });
        return;
      }

      const result = await FarmingService.claimRewards(req.user.id);
      
      console.log('[FarmingController] Награды собраны:', {
        user_id: req.user.id,
        result
      });

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('[FarmingController] Ошибка сбора наград фарминга:', error);
      res.status(500).json({
        success: false,
        error: 'Ошибка сбора наград фарминга'
      });
    }
  },

  /**
   * Остановка фарминга
   */
  async stopFarming(req: Request, res: Response): Promise<void> {
    try {
      console.log('[FarmingController] Остановка фарминга');
      
      if (!req.user?.id) {
        res.status(401).json({
          success: false,
          error: 'Требуется авторизация'
        });
        return;
      }

      const result = await FarmingService.stopFarming(req.user.id);
      
      console.log('[FarmingController] Фарминг остановлен:', {
        user_id: req.user.id,
        result
      });

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('[FarmingController] Ошибка остановки фарминга:', error);
      res.status(500).json({
        success: false,
        error: 'Ошибка остановки фарминга'
      });
    }
  }
}; 