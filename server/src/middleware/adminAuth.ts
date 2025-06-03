import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';
import { config } from '../config';

export const adminAuthMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({
        success: false,
        error: 'Отсутствует токен авторизации'
      });
      return;
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Неверный формат токена'
      });
      return;
    }

    try {
      const decoded = verify(token, config.jwtSecret) as { role: string };
      
      if (decoded.role !== 'admin') {
        res.status(403).json({
          success: false,
          error: 'Недостаточно прав для доступа'
        });
        return;
      }

      next();
    } catch (error) {
      res.status(401).json({
        success: false,
        error: 'Недействительный токен'
      });
    }
  } catch (error) {
    console.error('[AdminAuth] Ошибка аутентификации:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка аутентификации'
    });
  }
}; 