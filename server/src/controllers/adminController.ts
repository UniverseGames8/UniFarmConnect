import { Request, Response } from 'express';
import { AdminService } from '../services/adminService';

export const adminController = {
  /**
   * Получить статистику системы
   */
  async getSystemStats(req: Request, res: Response): Promise<void> {
    try {
      console.log('[AdminController] Получение статистики системы');
      
      const stats = await AdminService.getSystemStats();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('[AdminController] Ошибка получения статистики:', error);
      res.status(500).json({
        success: false,
        error: 'Ошибка получения статистики системы'
      });
    }
  },

  /**
   * Получить список пользователей
   */
  async getUsers(req: Request, res: Response): Promise<void> {
    try {
      const { page = '1', limit = '10', search } = req.query;
      console.log(`[AdminController] Получение списка пользователей (страница ${page}, лимит ${limit})`);
      
      const users = await AdminService.getUsers({
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        search: search as string
      });
      
      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      console.error('[AdminController] Ошибка получения списка пользователей:', error);
      res.status(500).json({
        success: false,
        error: 'Ошибка получения списка пользователей'
      });
    }
  },

  /**
   * Получить детальную информацию о пользователе
   */
  async getUserDetails(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId;
      console.log(`[AdminController] Получение деталей пользователя ${userId}`);
      
      const userDetails = await AdminService.getUserDetails(userId);
      
      res.json({
        success: true,
        data: userDetails
      });
    } catch (error) {
      console.error('[AdminController] Ошибка получения деталей пользователя:', error);
      res.status(500).json({
        success: false,
        error: 'Ошибка получения деталей пользователя'
      });
    }
  },

  /**
   * Обновить настройки пользователя
   */
  async updateUserSettings(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId;
      const settings = req.body;
      console.log(`[AdminController] Обновление настроек пользователя ${userId}`);
      
      const updatedUser = await AdminService.updateUserSettings(userId, settings);
      
      res.json({
        success: true,
        data: {
          user: updatedUser,
          message: 'Настройки пользователя успешно обновлены'
        }
      });
    } catch (error) {
      console.error('[AdminController] Ошибка обновления настроек пользователя:', error);
      res.status(500).json({
        success: false,
        error: 'Ошибка обновления настроек пользователя'
      });
    }
  },

  /**
   * Получить список транзакций
   */
  async getTransactions(req: Request, res: Response): Promise<void> {
    try {
      const { page = '1', limit = '10', type, status } = req.query;
      console.log(`[AdminController] Получение списка транзакций (страница ${page}, лимит ${limit})`);
      
      const transactions = await AdminService.getTransactions({
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        type: type as string,
        status: status as string
      });
      
      res.json({
        success: true,
        data: transactions
      });
    } catch (error) {
      console.error('[AdminController] Ошибка получения списка транзакций:', error);
      res.status(500).json({
        success: false,
        error: 'Ошибка получения списка транзакций'
      });
    }
  },

  /**
   * Обновить статус транзакции
   */
  async updateTransactionStatus(req: Request, res: Response): Promise<void> {
    try {
      const transactionId = req.params.transactionId;
      const { status } = req.body;
      console.log(`[AdminController] Обновление статуса транзакции ${transactionId} на ${status}`);
      
      const updatedTransaction = await AdminService.updateTransactionStatus(transactionId, status);
      
      res.json({
        success: true,
        data: {
          transaction: updatedTransaction,
          message: 'Статус транзакции успешно обновлен'
        }
      });
    } catch (error) {
      console.error('[AdminController] Ошибка обновления статуса транзакции:', error);
      res.status(500).json({
        success: false,
        error: 'Ошибка обновления статуса транзакции'
      });
    }
  }
}; 