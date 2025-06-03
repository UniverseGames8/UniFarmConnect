import { useEffect, useState } from 'react';
import { apiClient } from '@/core/api/client';
import { useWebSocket } from '@/shared/context/WebSocketContext';
import { useNotification } from '@/shared/context/NotificationContext';

interface Mission {
  id: string;
  title: string;
  description: string;
  reward: number;
  progress: number;
  target: number;
  isCompleted: boolean;
  type: 'daily' | 'weekly' | 'special';
}

export const Missions = () => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { lastMessage } = useWebSocket();
  const { addNotification } = useNotification();

  useEffect(() => {
    fetchMissions();
  }, []);

  // Обработка WebSocket сообщений
  useEffect(() => {
    if (lastMessage?.type === 'mission_update') {
      const updatedMission = lastMessage.data;
      setMissions(prev => 
        prev.map(mission => 
          mission.id === updatedMission.id ? updatedMission : mission
        )
      );

      if (updatedMission.isCompleted) {
        addNotification(
          'success',
          `Миссия "${updatedMission.title}" выполнена! +${updatedMission.reward} UNI`
        );
      }
    }
  }, [lastMessage, addNotification]);

  const fetchMissions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { data } = await apiClient.get('/missions/list');
      setMissions(data);
    } catch (err) {
      setError('Не удалось загрузить список миссий');
      console.error('[Missions] Ошибка загрузки миссий:', err);
      addNotification('error', 'Не удалось загрузить список миссий');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaimReward = async (missionId: string) => {
    try {
      await apiClient.post(`/missions/${missionId}/claim`);
      addNotification('success', 'Награда успешно получена!');
      fetchMissions(); // Обновляем список миссий
    } catch (err) {
      console.error('[Missions] Ошибка получения награды:', err);
      addNotification('error', 'Не удалось получить награду');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Миссии</h2>
        <p className="text-gray-600">
          Выполняйте миссии и получайте награды в токенах UNI
        </p>
      </div>

      {/* Mission Types */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl mb-2">📅</div>
          <div className="font-semibold">Ежедневные</div>
          <div className="text-sm text-gray-500">
            {missions.filter(m => m.type === 'daily').length} миссий
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl mb-2">📅</div>
          <div className="font-semibold">Еженедельные</div>
          <div className="text-sm text-gray-500">
            {missions.filter(m => m.type === 'weekly').length} миссий
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl mb-2">🎯</div>
          <div className="font-semibold">Специальные</div>
          <div className="text-sm text-gray-500">
            {missions.filter(m => m.type === 'special').length} миссий
          </div>
        </div>
      </div>

      {/* Mission List */}
      <div className="space-y-4">
        {missions.map((mission) => (
          <div key={mission.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold text-gray-900">{mission.title}</h3>
                <p className="text-sm text-gray-600">{mission.description}</p>
              </div>
              <div className="text-right">
                <div className="font-bold text-blue-600">{mission.reward} UNI</div>
                <div className="text-xs text-gray-500">
                  {mission.type === 'daily' ? 'Ежедневная' : 
                   mission.type === 'weekly' ? 'Еженедельная' : 'Специальная'}
                </div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(mission.progress / mission.target) * 100}%` }}
              />
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <div className="text-gray-600">
                Прогресс: {mission.progress}/{mission.target}
              </div>
              {mission.isCompleted && !mission.reward && (
                <button
                  onClick={() => handleClaimReward(mission.id)}
                  className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  Получить награду
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4">
          {error}
        </div>
      )}
    </div>
  );
}; 