import { useEffect, useState } from 'react';
import { useAuthContext } from '@/modules/auth/context/AuthContext';
import { apiClient } from '@/core/api/client';
import { useWebSocket } from '@/shared/context/WebSocketContext';
import { useNotification } from '@/shared/context/NotificationContext';

interface DashboardStats {
  totalBalance: number;
  farmingRewards: number;
  activeMissions: number;
  completedMissions: number;
}

export const Dashboard = () => {
  const { user } = useAuthContext();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { lastMessage } = useWebSocket();
  const { addNotification } = useNotification();

  useEffect(() => {
    fetchStats();
  }, []);

  // Обработка WebSocket сообщений
  useEffect(() => {
    if (lastMessage?.type === 'stats_update') {
      const updatedStats = lastMessage.data;
      setStats(updatedStats);
      
      // Уведомления о значимых изменениях
      if (updatedStats.farmingRewards > (stats?.farmingRewards || 0)) {
        const diff = updatedStats.farmingRewards - (stats?.farmingRewards || 0);
        if (diff > 0) {
          addNotification('info', `Получено ${diff.toFixed(2)} UNI за фарминг`);
        }
      }
      
      if (updatedStats.completedMissions > (stats?.completedMissions || 0)) {
        addNotification('success', 'Выполнена новая миссия!');
      }
    }
  }, [lastMessage, stats, addNotification]);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { data } = await apiClient.get('/dashboard/stats');
      setStats(data);
    } catch (err) {
      setError('Не удалось загрузить статистику');
      console.error('[Dashboard] Ошибка загрузки статистики:', err);
      addNotification('error', 'Не удалось загрузить статистику');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600">
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Добро пожаловать, {user?.first_name || 'Фермер'}! 👋
        </h2>
        <p className="text-gray-600">
          Управляйте своим фермерским хозяйством и зарабатывайте токены
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500 mb-1">Общий баланс</div>
          <div className="text-2xl font-bold text-gray-900">
            {stats?.totalBalance.toFixed(2)} UNI
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500 mb-1">Награды за фарминг</div>
          <div className="text-2xl font-bold text-gray-900">
            {stats?.farmingRewards.toFixed(2)} UNI
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500 mb-1">Активные миссии</div>
          <div className="text-2xl font-bold text-gray-900">
            {stats?.activeMissions}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500 mb-1">Выполненные миссии</div>
          <div className="text-2xl font-bold text-gray-900">
            {stats?.completedMissions}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Быстрые действия
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => window.location.href = '/farming'}
            className="flex items-center justify-center space-x-2 bg-blue-600 text-white rounded-lg p-4 hover:bg-blue-700 transition-colors"
          >
            <span>🌱</span>
            <span>Начать фарминг</span>
          </button>
          <button 
            onClick={() => window.location.href = '/missions'}
            className="flex items-center justify-center space-x-2 bg-green-600 text-white rounded-lg p-4 hover:bg-green-700 transition-colors"
          >
            <span>🎯</span>
            <span>Миссии</span>
          </button>
        </div>
      </div>
    </div>
  );
}; 