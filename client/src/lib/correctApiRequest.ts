/**
 * Утилита для корректного выполнения API запросов с обработкой Telegram WebApp данных
 */

import apiConfig from '@/config/apiConfig';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  credentials?: RequestCredentials;
}

export async function correctApiRequest<T = any>(
  url: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  data?: any
): Promise<T> {
  try {
    // Получаем полный URL
    const fullUrl = url.startsWith('http') ? url : apiConfig.getFullUrl(url);

    // Получаем заголовки
    const headers = apiConfig.getDefaultHeaders();

    // Выполняем запрос
    const response = await fetch(fullUrl, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
      credentials: 'include'
    });

    // Парсим ответ
    const result = await response.json();
    
    // Проверяем статус ответа
    if (!response.ok) {
      throw new Error(result.error || 'API request failed');
    }

    return result;
  } catch (error: any) {
    console.error('API request error:', error);
    throw error;
  }
}

export default correctApiRequest;