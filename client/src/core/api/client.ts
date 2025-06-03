import axios from 'axios';
import { telegramService } from '@/modules/auth/services/telegramService';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Добавляем заголовки Telegram в каждый запрос
apiClient.interceptors.request.use((config) => {
  const authHeaders = telegramService.getAuthHeaders();
  return {
    ...config,
    headers: {
      ...config.headers,
      ...authHeaders
    }
  };
});

// Обработка ошибок
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Обработка ошибки аутентификации
      console.error('[API Client] Ошибка аутентификации:', error);
    }
    return Promise.reject(error);
  }
); 