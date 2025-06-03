import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { config } from '../config';
import crypto from 'crypto';

export class TelegramService {
  /**
   * Инициализация Telegram WebApp
   */
  static async initializeTelegramWebApp(): Promise<boolean> {
    try {
      console.log('[TelegramService] Инициализация Telegram WebApp');
      
      // Здесь можно добавить дополнительную логику инициализации
      // Например, проверку токена бота, настройку webhook и т.д.
      
      return true;
    } catch (error) {
      console.error('[TelegramService] Ошибка инициализации WebApp:', error);
      return false;
    }
  }

  /**
   * Валидация данных Telegram
   */
  static async validateTelegramData(initData: string): Promise<boolean> {
    try {
      console.log('[TelegramService] Валидация данных Telegram');
      
      if (!initData) {
        return false;
      }

      // Парсим данные
      const params = new URLSearchParams(initData);
      const hash = params.get('hash');
      params.delete('hash');

      // Сортируем параметры
      const sortedParams = Array.from(params.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');

      // Создаем HMAC
      const secretKey = crypto.createHmac('sha256', 'WebAppData')
        .update(config.telegramBotToken || '')
        .digest();

      const calculatedHash = crypto.createHmac('sha256', secretKey)
        .update(sortedParams)
        .digest('hex');

      return calculatedHash === hash;
    } catch (error) {
      console.error('[TelegramService] Ошибка валидации данных:', error);
      return false;
    }
  }

  /**
   * Получение пользователя по Telegram ID
   */
  static async getUserFromTelegram(telegramId: string): Promise<any | null> {
    try {
      console.log(`[TelegramService] Получение пользователя по Telegram ID: ${telegramId}`);
      
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.telegram_id, parseInt(telegramId)))
        .limit(1);

      return user || null;
    } catch (error) {
      console.error('[TelegramService] Ошибка получения пользователя:', error);
      return null;
    }
  }

  /**
   * Отправка уведомления пользователю
   */
  static async sendTelegramNotification(userId: string, message: string): Promise<boolean> {
    try {
      console.log(`[TelegramService] Отправка уведомления пользователю ${userId}`);
      
      // Получаем пользователя
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, parseInt(userId)))
        .limit(1);

      if (!user || !user.telegram_id) {
        console.error('[TelegramService] Пользователь не найден или не имеет Telegram ID');
        return false;
      }

      // Здесь должна быть логика отправки сообщения через Telegram Bot API
      // Например, использование axios для отправки запроса к API Telegram
      
      return true;
    } catch (error) {
      console.error('[TelegramService] Ошибка отправки уведомления:', error);
      return false;
    }
  }

  /**
   * Настройка Telegram Webhook
   */
  static async setupTelegramWebhook(url: string): Promise<boolean> {
    try {
      console.log(`[TelegramService] Настройка webhook для URL: ${url}`);
      
      // Здесь должна быть логика настройки webhook через Telegram Bot API
      // Например, использование axios для отправки запроса к API Telegram
      
      return true;
    } catch (error) {
      console.error('[TelegramService] Ошибка настройки webhook:', error);
      return false;
    }
  }
} 