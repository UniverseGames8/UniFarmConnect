import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';

export const telegramAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const initData = req.headers['x-telegram-init-data'] as string;
    
    if (!initData) {
      return res.status(401).json({
        success: false,
        error: 'Отсутствуют данные Telegram'
      });
    }

    const isValid = await AuthService.validateTelegramInitData(initData);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: 'Недействительные данные Telegram'
      });
    }

    // Парсим данные пользователя
    const params = new URLSearchParams(initData);
    const userData = JSON.parse(params.get('user') || '{}');
    
    if (!userData.id) {
      return res.status(401).json({
        success: false,
        error: 'Отсутствуют данные пользователя'
      });
    }

    // Добавляем данные пользователя в request
    req.telegramUser = userData;

    next();
  } catch (error) {
    console.error('[TelegramAuthMiddleware] Ошибка аутентификации:', error);
    return res.status(500).json({
      success: false,
      error: 'Ошибка аутентификации через Telegram'
    });
  }
}; 