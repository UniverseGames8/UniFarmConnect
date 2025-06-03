/**
 * Конфигурация API-клиента для UniFarm
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v2';

export default {
  /**
   * Формирует полный URL для API-запроса
   * @param path Относительный путь эндпоинта API
   * @returns Полный URL для запроса
   */
  getFullUrl: (path: string) => {
    // Убираем дублирующиеся слеши
    const cleanPath = path.replace(/^\/+/, '');
    return `${API_BASE_URL}/${cleanPath}`;
  },

  /**
   * Тайм-аут запроса в миллисекундах
   */
  timeout: 30000,

  /**
   * Количество попыток повтора запроса при ошибке
   */
  maxRetries: 3,

  /**
   * Базовые заголовки для всех запросов
   */
  getDefaultHeaders: () => {
    const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    };

    // Добавляем guest_id из localStorage, если он есть
    const guestId = localStorage.getItem('guest_id');
    if (guestId) {
      headers['X-Guest-ID'] = guestId;
    }

    return headers;
  },

  /**
   * Конфигурация для различных эндпоинтов
   */
  endpoints: {
    auth: 'auth',
    users: 'users',
    wallet: 'wallet',
    farming: 'farming',
    missions: 'missions',
    referral: 'referral',
    boost: 'boost',
    dailyBonus: 'daily-bonus',
    telegram: 'telegram',
    admin: 'admin'
  }
};