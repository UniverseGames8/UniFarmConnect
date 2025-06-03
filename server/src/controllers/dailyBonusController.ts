import { Request, Response } from 'express';
import { DailyBonusService } from '../services/dailyBonusService';

export const dailyBonusController = {
  /**
   * Получить информацию о ежедневном бонусе пользователя
   */
  async getDailyBonusInfo(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId;
      console.log(`[DailyBonusController] Получение информации о ежедневном бонусе для пользователя ${userId}`);
      
      const dailyBonusInfo = await DailyBonusService.getDailyBonusInfo(userId);

      res.json({
        success: true,
        data: dailyBonusInfo
      });
    } catch (error) {
      console.error('[DailyBonusController] Ошибка получения информации о ежедневном бонусе:', error);
      res.status(500).json({
        success: false,
        error: 'Ошибка получения информации о ежедневном бонусе'
      });
    }
  },

  /**
   * Забрать ежедневный бонус
   */
  async claimDailyBonus(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.body;
      console.log(`[DailyBonusController] Получение ежедневного бонуса для пользователя ${userId}`);
      
      if (!userId) {
        res.status(400).json({
          success: false,
          error: 'Не указан userId'
        });
        return;
      }

      const claimResult = await DailyBonusService.claimDailyBonus(userId);

      res.json({
        success: true,
        data: {
          ...claimResult,
          message: `Ежедневный бонус ${claimResult.bonus_amount} UNI успешно получен!`
        }
      });
    } catch (error) {
      console.error('[DailyBonusController] Ошибка получения ежедневного бонуса:', error);
      res.status(500).json({
        success: false,
        error: 'Ошибка получения ежедневного бонуса'
      });
    }
  },

  /**
   * Получить календарь ежедневных бонусов
   */
  async getDailyBonusCalendar(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId;
      const month = req.query.month as string || new Date().getMonth().toString();
      const year = req.query.year as string || new Date().getFullYear().toString();
      
      console.log(`[DailyBonusController] Получение календаря бонусов для пользователя ${userId}, ${month}/${year}`);
      
      const calendar = await DailyBonusService.getDailyBonusCalendar(userId, parseInt(month), parseInt(year));

      res.json({
        success: true,
        data: calendar
      });
    } catch (error) {
      console.error('[DailyBonusController] Ошибка получения календаря бонусов:', error);
      res.status(500).json({
        success: false,
        error: 'Ошибка получения календаря бонусов'
      });
    }
  },

  /**
   * Получить статистику ежедневных бонусов
   */
  async getDailyBonusStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId;
      console.log(`[DailyBonusController] Получение статистики ежедневных бонусов для пользователя ${userId}`);
      
      const stats = await DailyBonusService.getDailyBonusStats(userId);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('[DailyBonusController] Ошибка получения статистики бонусов:', error);
      res.status(500).json({
        success: false,
        error: 'Ошибка получения статистики бонусов'
      });
    }
  },

  /**
   * Проверить доступность ежедневного бонуса
   */
  async checkDailyBonusAvailability(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId;
      console.log(`[DailyBonusController] Проверка доступности ежедневного бонуса для пользователя ${userId}`);
      
      const availability = await DailyBonusService.checkDailyBonusAvailability(userId);

      res.json({
        success: true,
        data: availability
      });
    } catch (error) {
      console.error('[DailyBonusController] Ошибка проверки доступности бонуса:', error);
      res.status(500).json({
        success: false,
        error: 'Ошибка проверки доступности бонуса'
      });
    }
  }
}; 