export const APP_CONFIG = {
  name: 'UniFarm',
  version: '1.0.0',
  environment: process.env.NODE_ENV || 'development',
  apiUrl: process.env.API_URL || 'http://localhost:3000',
  wsUrl: process.env.WS_URL || 'ws://localhost:3000',
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
  telegramBotUsername: process.env.TELEGRAM_BOT_USERNAME || '',
  telegramWebAppUrl: process.env.TELEGRAM_WEBAPP_URL || '',
  tonConnectManifestUrl: process.env.TON_CONNECT_MANIFEST_URL || '',
  tonConnectManifest: {
    url: process.env.TON_CONNECT_MANIFEST_URL || '',
    name: 'UniFarm',
    iconUrl: 'https://unifarm.app/icon.png',
    termsOfUseUrl: 'https://unifarm.app/terms',
    privacyPolicyUrl: 'https://unifarm.app/privacy'
  }
};