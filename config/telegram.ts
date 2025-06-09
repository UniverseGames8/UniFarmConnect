export const telegramConfig = {
  botToken: process.env.TELEGRAM_BOT_TOKEN || '',
  botUsername: process.env.TELEGRAM_BOT_USERNAME || '',
  webAppUrl: process.env.TELEGRAM_WEBAPP_URL || '',
  webhookUrl: process.env.TELEGRAM_WEBHOOK_URL || '',
  webhookSecret: process.env.TELEGRAM_WEBHOOK_SECRET || '',
  validateInitData: process.env.TELEGRAM_VALIDATE_INIT_DATA === 'true',
  webAppName: process.env.TELEGRAM_WEBAPP_NAME || 'UniFarm',
  apiUrl: 'https://api.telegram.org',
  maxRetries: 3,
  timeout: 30000
};