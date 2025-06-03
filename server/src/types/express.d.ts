import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        sessionId: string;
      };
      telegramUser?: {
        id: number;
        username?: string;
        first_name?: string;
        last_name?: string;
        language_code?: string;
        is_premium?: boolean;
      };
    }
  }
} 