import { TelegramWebApp, TelegramUser } from '../types';

class TelegramService {
  private webApp: TelegramWebApp | null = null;

  /**
   * Инициализация Telegram WebApp
   */
  async initialize(): Promise<boolean> {
    try {
      console.log('[TelegramService] Инициализация Telegram WebApp');

      if (typeof window === 'undefined') {
        console.log('[TelegramService] Окружение не браузер');
        return false;
      }

      // Ждем полной загрузки Telegram WebApp
      const initTelegram = () => {
        if (window.Telegram?.WebApp) {
          this.webApp = window.Telegram.WebApp;
          this.webApp.ready();
          this.webApp.expand();
          console.log('[TelegramService] Telegram WebApp успешно инициализирован');
          return true;
        }
        console.log('[TelegramService] Telegram WebApp недоступен');
        return false;
      };

      // Если Telegram уже доступен - инициализируем сразу
      if (window.Telegram?.WebApp) {
        return initTelegram();
      }

      // Иначе ждем загрузки
      return new Promise((resolve) => {
        document.addEventListener('DOMContentLoaded', () => {
          resolve(initTelegram());
        });
        // Fallback на случай, если DOMContentLoaded уже сработал
        setTimeout(() => resolve(initTelegram()), 100);
      });
    } catch (error) {
      console.error('[TelegramService] Ошибка инициализации:', error);
      return false;
    }
  }

  /**
   * Получение данных пользователя
   */
  getUser(): TelegramUser | null {
    if (!this.webApp) {
      console.log('[TelegramService] WebApp недоступен для получения пользователя');
      return null;
    }
    return this.webApp.initDataUnsafe.user || null;
  }

  /**
   * Получение initData для отправки на сервер
   */
  getInitData(): string {
    if (!this.webApp) {
      console.log('[TelegramService] WebApp недоступен для получения initData');
      return '';
    }
    return this.webApp.initData;
  }

  /**
   * Подготовка заголовков для API запросов
   */
  getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};
    const initData = this.getInitData();
    const user = this.getUser();

    if (initData) {
      headers['X-Telegram-Init-Data'] = initData;
    }

    if (user?.id) {
      headers['X-Telegram-User-Id'] = user.id.toString();
    }

    return headers;
  }

  /**
   * Проверка на реальное Telegram окружение
   */
  isRealTelegramEnvironment(): boolean {
    if (!this.webApp) return false;

    const hasValidInitData = this.getInitData().length > 0;
    const hasValidUser = !!this.getUser();
    const isTelegramUserAgent = navigator.userAgent.includes('Telegram');

    return hasValidInitData && hasValidUser && isTelegramUserAgent;
  }
}

export const telegramService = new TelegramService();
export default telegramService; 