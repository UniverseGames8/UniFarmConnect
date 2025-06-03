import dotenv from 'dotenv';

// Загрузка переменных окружения
dotenv.config();

export const config = {
  // API
  apiPrefix: process.env.API_PREFIX || '/api/v2',
  port: parseInt(process.env.PORT || '3000', 10),

  // База данных
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/unifarm',

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
  environment: process.env.NODE_ENV || 'development'
}; 