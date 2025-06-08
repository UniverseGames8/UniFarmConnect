import { Router } from 'express';
import { telegramController } from '../controllers/telegramController';

const router = Router();

// Отладочный endpoint для проверки состояния Telegram интеграции
// router.get('/debug', telegramController.debugMiddleware);

// Инициализация Telegram WebApp
// router.post('/init', telegramController.initializeWebApp);

// Отправка уведомления пользователю
// router.post('/notify', telegramController.sendNotification);

// Webhook endpoint для получения обновлений от Telegram
router.post('/webhook', telegramController.webhook);

// Настройка webhook
router.post('/setup-webhook', telegramController.setupWebhook);

// Получение информации о webhook
router.get('/webhook-info', telegramController.getWebhookInfo);

export default router; 