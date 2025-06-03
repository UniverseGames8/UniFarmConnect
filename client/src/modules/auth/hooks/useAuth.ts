import { useState, useEffect, useCallback } from 'react';
import { AuthState, AuthContextType } from '../types';
import { telegramService } from '../services/telegramService';
import { apiClient } from '@/core/api/client';

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  isLoading: true,
  error: null
};

export const useAuth = (): AuthContextType => {
  const [state, setState] = useState<AuthState>(initialState);

  const checkAuth = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Инициализируем Telegram WebApp
      const isInitialized = await telegramService.initialize();
      if (!isInitialized) {
        throw new Error('Telegram WebApp не инициализирован');
      }

      // Получаем данные пользователя
      const user = telegramService.getUser();
      if (!user) {
        throw new Error('Пользователь не найден');
      }

      // Проверяем аутентификацию на сервере
      const { data } = await apiClient.get('/auth/validate', {
        headers: telegramService.getAuthHeaders()
      });

      setState({
        isAuthenticated: true,
        user,
        isLoading: false,
        error: null
      });
    } catch (error) {
      console.error('[useAuth] Ошибка проверки аутентификации:', error);
      setState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Ошибка аутентификации'
      });
    }
  }, []);

  const login = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      await checkAuth();
    } catch (error) {
      console.error('[useAuth] Ошибка входа:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Ошибка входа'
      }));
    }
  }, [checkAuth]);

  const logout = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      await apiClient.post('/auth/logout', {}, {
        headers: telegramService.getAuthHeaders()
      });
      setState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: null
      });
    } catch (error) {
      console.error('[useAuth] Ошибка выхода:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Ошибка выхода'
      }));
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    ...state,
    login,
    logout,
    checkAuth
  };
}; 