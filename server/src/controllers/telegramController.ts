import axios from 'axios';
import { Request, Response } from 'express';
import { TelegramUpdate, TelegramWebhookResponse } from '../types/telegram';
import { logger } from '../utils/logger';

const TELEGRAM_API = 'https://api.telegram.org/bot';
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export const telegramController = {
  // Webhook handler
  async webhook(req: Request, res: Response) {
    try {
      const update = req.body as TelegramUpdate;
      logger.info('Received Telegram update', { update_id: update.update_id });

      // Обработка сообщений
      if (update.message) {
        await this.handleMessage(update.message);
      }

      // Обработка callback query
      if (update.callback_query) {
        await this.handleCallbackQuery(update.callback_query);
      }

      res.status(200).json({ ok: true } as TelegramWebhookResponse);
    } catch (error: any) {
      logger.error('Telegram webhook error', { error: error.message });
      res.status(500).json({ 
        ok: false, 
        error: error.message 
      } as TelegramWebhookResponse);
    }
  },

  // Обработка сообщений
  async handleMessage(message: any) {
    try {
      const chatId = message.chat.id;
      const text = message.text;

      // Обработка команд
      if (text?.startsWith('/')) {
        await this.handleCommand(message);
        return;
      }

      // Обработка обычных сообщений
      await this.sendMessage(chatId, `Вы написали: ${text}`);
    } catch (error) {
      logger.error('Error handling message', { error });
      throw error;
    }
  },

  // Обработка callback query
  async handleCallbackQuery(callbackQuery: any) {
    try {
      const chatId = callbackQuery.message.chat.id;
      const data = callbackQuery.data;

      // Обработка различных callback данных
      switch (data) {
        case 'start_farming':
          await this.sendMessage(chatId, '🚜 Начинаем фарминг!');
          break;
        case 'check_balance':
          await this.sendMessage(chatId, '💰 Проверяем баланс...');
          break;
        default:
          await this.sendMessage(chatId, `Вы нажали кнопку: ${data}`);
      }
    } catch (error) {
      logger.error('Error handling callback query', { error });
      throw error;
    }
  },

  // Обработка команд
  async handleCommand(message: any) {
    const chatId = message.chat.id;
    const command = message.text.split(' ')[0].toLowerCase();

    switch (command) {
      case '/start':
        await this.sendMessage(chatId, '👋 Добро пожаловать в UniFarm!');
        break;
      case '/help':
        await this.sendMessage(chatId, '📚 Доступные команды:\n/start - Начать\n/help - Помощь\n/balance - Баланс');
        break;
      case '/balance':
        await this.sendMessage(chatId, '💰 Проверяем ваш баланс...');
        break;
      default:
        await this.sendMessage(chatId, '❓ Неизвестная команда. Используйте /help для списка команд.');
    }
  },

  // Отправка сообщения
  async sendMessage(chatId: number, text: string) {
    try {
      await axios.post(`${TELEGRAM_API}${BOT_TOKEN}/sendMessage`, {
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML'
      });
    } catch (error) {
      logger.error('Error sending message', { error, chatId });
      throw error;
    }
  },

  // Настройка webhook
  async setupWebhook(req: Request, res: Response) {
    try {
      const webhookUrl = req.body.webhookUrl;
      
      if (!webhookUrl) {
        return res.status(400).json({ 
          ok: false, 
          error: 'Webhook URL is required' 
        });
      }

      const response = await axios.post(
        `${TELEGRAM_API}${BOT_TOKEN}/setWebhook`,
        { url: webhookUrl }
      );

      res.json(response.data);
    } catch (error: any) {
      logger.error('Error setting up webhook', { error: error.message });
      res.status(500).json({ 
        ok: false, 
        error: error.message 
      });
    }
  },

  // Получение информации о webhook
  async getWebhookInfo(req: Request, res: Response) {
    try {
      const response = await axios.get(
        `${TELEGRAM_API}${BOT_TOKEN}/getWebhookInfo`
      );
      res.json(response.data);
    } catch (error: any) {
      logger.error('Error getting webhook info', { error: error.message });
      res.status(500).json({ 
        ok: false, 
        error: error.message 
      });
    }
  }
}; 