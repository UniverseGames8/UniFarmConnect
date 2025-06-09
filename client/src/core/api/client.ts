import axios from 'axios';
import { APP_CONFIG } from '../../config/app';

const apiClient = axios.create({
  baseURL: APP_CONFIG.API.BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Добавляем заголовки Telegram в каждый запрос
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Обработка ошибок
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient; 