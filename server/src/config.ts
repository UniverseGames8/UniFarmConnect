import dotenv from 'dotenv';

// Загрузка переменных окружения
dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

export const config = {
  // API
  apiPrefix: process.env.API_PREFIX || '/api/v2',
  port: parseInt(process.env.PORT || '3000', 10),

  // База данных
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/unifarm',
  databaseSSL: isProduction,

  // JWT
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',

  // Telegram
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
  telegramWebAppUrl: process.env.TELEGRAM_WEBAPP_URL,

  // TON
  tonApiKey: process.env.TON_API_KEY,
  tonApiUrl: process.env.TON_API_URL || 'https://toncenter.com/api/v2',

  // Приложение
  appName: 'UniFarm Connect',
  appVersion: '2.0.0',
  environment: process.env.NODE_ENV || 'development',

  // Безопасность
  corsOrigin: isProduction 
    ? process.env.CORS_ORIGIN 
    : ['http://localhost:5173', 'http://localhost:3000'],
  
  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10)
  },

  // Логирование
  logging: {
    level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
    format: isProduction ? 'json' : 'dev'
  }
}; 