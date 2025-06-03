import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'Отсутствует токен авторизации'
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Неверный формат токена'
      });
    }

    const isValid = await AuthService.validateToken(token);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: 'Недействительный токен'
      });
    }

    // Добавляем информацию о пользователе в request
    const sessionInfo = await AuthService.getSessionInfo(token);
    req.user = {
      id: sessionInfo.user_id,
      sessionId: sessionInfo.session_id
    };

    next();
  } catch (error) {
    console.error('[AuthMiddleware] Ошибка аутентификации:', error);
    return res.status(500).json({
      success: false,
      error: 'Ошибка аутентификации'
    });
  }
}; 