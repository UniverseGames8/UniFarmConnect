import { Request, Response } from 'express';
import { UserService } from '../services/userService';

export const userController = {
  /**
   * Получение данных текущего пользователя
   */
  async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      console.log('[UserController] Получение данных текущего пользователя');
      
      if (!req.user?.id) {
        res.status(401).json({
          success: false,
          error: 'Требуется авторизация'
        });
        return;
      }

      const user = await UserService.getUserById(req.user.id);
      
      if (!user) {
        console.log('[UserController] Пользователь не найден:', { user_id: req.user.id });
        res.status(404).json({
          success: false,
          error: 'Пользователь не найден'
        });
        return;
      }

      console.log('[UserController] Данные пользователя получены:', {
        user_id: user.id,
        telegram_id: user.telegram_id
      });

      res.json({
        success: true,
        data: {
          id: user.id,
          telegram_id: user.telegram_id,
          username: user.username,
          ref_code: user.ref_code,
          parent_ref_code: user.parent_ref_code,
          balance_uni: user.balance_uni,
          balance_ton: user.balance_ton,
          created_at: user.created_at
        }
      });
    } catch (error) {
      console.error('[UserController] Ошибка получения данных пользователя:', error);
      res.status(500).json({
        success: false,
        error: 'Ошибка получения данных пользователя'
      });
    }
  },

  /**
   * Создание нового пользователя
   */
  async createUser(req: Request, res: Response): Promise<void> {
    try {
      console.log('[UserController] Создание нового пользователя');
      
      const { guest_id, parent_ref_code } = req.body;

      if (!guest_id) {
        res.status(400).json({
          success: false,
          error: 'guest_id обязателен'
        });
        return;
      }

      const user = await UserService.createUser({
        guest_id,
        parent_ref_code: parent_ref_code || null
      });

      console.log('[UserController] Пользователь создан:', {
        user_id: user.id,
        guest_id: user.guest_id
      });

      res.json({
        success: true,
        data: {
          id: user.id,
          guest_id: user.guest_id,
          ref_code: user.ref_code
        }
      });
    } catch (error) {
      console.error('[UserController] Ошибка создания пользователя:', error);
      res.status(500).json({
        success: false,
        error: 'Ошибка создания пользователя'
      });
    }
  },

  /**
   * Обновление данных пользователя
   */
  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      console.log('[UserController] Обновление данных пользователя');
      
      if (!req.user?.id) {
        res.status(401).json({
          success: false,
          error: 'Требуется авторизация'
        });
        return;
      }

      const updates = req.body;
      const user = await UserService.updateUser(req.user.id, updates);

      if (!user) {
        console.log('[UserController] Пользователь не найден:', { user_id: req.user.id });
        res.status(404).json({
          success: false,
          error: 'Пользователь не найден'
        });
        return;
      }

      console.log('[UserController] Данные пользователя обновлены:', {
        user_id: user.id,
        updates
      });

      res.json({
        success: true,
        data: {
          id: user.id,
          username: user.username,
          balance_uni: user.balance_uni,
          balance_ton: user.balance_ton
        }
      });
    } catch (error) {
      console.error('[UserController] Ошибка обновления данных пользователя:', error);
      res.status(500).json({
        success: false,
        error: 'Ошибка обновления данных пользователя'
      });
    }
  },

  /**
   * Генерация реферального кода
   */
  async generateRefCode(req: Request, res: Response): Promise<void> {
    try {
      console.log('[UserController] Генерация реферального кода');
      
      if (!req.user?.id) {
        res.status(401).json({
          success: false,
          error: 'Требуется авторизация'
        });
        return;
      }

      const refCode = await UserService.generateRefCode(req.user.id);

      console.log('[UserController] Реферальный код сгенерирован:', {
        user_id: req.user.id,
        ref_code: refCode
      });

      res.json({
        success: true,
        data: {
          ref_code: refCode
        }
      });
    } catch (error) {
      console.error('[UserController] Ошибка генерации реферального кода:', error);
      res.status(500).json({
        success: false,
        error: 'Ошибка генерации реферального кода'
      });
    }
  }
}; 