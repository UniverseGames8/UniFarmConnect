import axios from 'axios';
import { Request, Response } from 'express';

const TELEGRAM_API = 'https://api.telegram.org/bot';
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export const telegramController = {
  // Webhook handler
  async webhook(req: Request, res: Response) {
    try {
      const body = req.body;
      // message event
      if (body.message) {
        const chatId = body.message.chat.id;
        const text = body.message.text;
        // Пример: отправить echo-ответ
        await axios.post(`${TELEGRAM_API}${BOT_TOKEN}/sendMessage`, {
          chat_id: chatId,
          text: `Вы написали: ${text}`
        });
      }
      // callback_query event
      if (body.callback_query) {
        const chatId = body.callback_query.message.chat.id;
        const data = body.callback_query.data;
        // Пример: отправить ответ на callback
        await axios.post(`${TELEGRAM_API}${BOT_TOKEN}/sendMessage`, {
          chat_id: chatId,
          text: `Вы нажали кнопку: ${data}`
        });
      }
      res.status(200).json({ ok: true });
    } catch (error: any) {
      console.error('[Telegram webhook error]', error);
      res.status(500).json({ ok: false, error: error.message });
    }
  },

  // (Опционально) другие методы...
}; 