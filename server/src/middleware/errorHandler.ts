import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('[ErrorHandler]', err);

  // Определяем тип ошибки и соответствующий статус
  let status = 500;
  let message = 'Внутренняя ошибка сервера';

  if (err.name === 'ValidationError') {
    status = 400;
    message = err.message;
  } else if (err.name === 'UnauthorizedError') {
    status = 401;
    message = 'Необходима авторизация';
  } else if (err.name === 'ForbiddenError') {
    status = 403;
    message = 'Доступ запрещен';
  } else if (err.name === 'NotFoundError') {
    status = 404;
    message = 'Ресурс не найден';
  }

  res.status(status).json({
    success: false,
    error: message
  });
}; 