import { Router } from 'express';
import { telegramController } from '../controllers/telegramController';

const router = Router();

// Отладочный endpoint для проверки состояния Telegram интеграции
router.get('/debug', telegramController.debugMiddleware);

// Инициализация Telegram WebApp
router.post('/init', telegramController.initializeWebApp);

// Отправка уведомления пользователю
router.post('/notify', telegramController.sendNotification);

// Настройка webhook
router.post('/webhook', telegramController.setupWebhook);

export default router; 