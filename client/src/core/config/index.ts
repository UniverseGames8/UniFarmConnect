/**
 * Централизованная конфигурация системы UniFarm
 */

import { APP_CONFIG } from '../../config/app';
import { DATABASE_CONFIG } from '../../config/database';
import { TELEGRAM_CONFIG } from '../../config/telegram';

export const config = {
  app: APP_CONFIG,
  database: DATABASE_CONFIG,
  telegram: TELEGRAM_CONFIG,
  
  // Настройки сервера
  server: {
    port: parseInt(process.env.PORT || '3000'),
    host: process.env.HOST || '0.0.0.0',
    nodeEnv: process.env.NODE_ENV || 'development',
  },

  // API конфигурация
  api: {
    version: 'v2',
    baseUrl: process.env.API_BASE_URL || '/api/v2',
    timeout: 30000,
  },

  // Безопасность
  security: {
    cors: {
      origin: process.env.CORS_ORIGIN || true,
      credentials: true,
    },
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 минут
      max: 100, // лимит запросов на IP
    },
  },
};

export default config;