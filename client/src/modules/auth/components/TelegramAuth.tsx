import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { telegramService } from '../services/telegramService';

export const TelegramAuth = () => {
  const { login, isLoading, error } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = async () => {
      try {
        await login();
        navigate('/dashboard');
      } catch (error) {
        console.error('[TelegramAuth] Ошибка аутентификации:', error);
      }
    };

    initAuth();
  }, [login, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Подключение к Telegram...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h1 className="text-2xl font-bold mb-4 text-red-600">Ошибка аутентификации</h1>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  return null;
}; 