import { useEffect, useState } from 'react';
import { apiClient } from '@/core/api/client';
import { useWebSocket } from '@/shared/context/WebSocketContext';
import { useNotification } from '@/shared/context/NotificationContext';

interface FarmingData {
  isActive: boolean;
  startTime: string | null;
  amount: number;
  rewards: number;
  dailyRate: number;
}

export const Farming = () => {
  const [farmingData, setFarmingData] = useState<FarmingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const { lastMessage } = useWebSocket();
  const { addNotification } = useNotification();

  useEffect(() => {
    fetchFarmingData();
  }, []);

  // Обработка WebSocket сообщений
  useEffect(() => {
    if (lastMessage?.type === 'farming_update') {
      const updatedData = lastMessage.data;
      setFarmingData(updatedData);
      
      if (updatedData.rewards > 0) {
        addNotification('info', `Доступно наград: ${updatedData.rewards.toFixed(2)} UNI`);
      }
    }
  }, [lastMessage, addNotification]);

  const fetchFarmingData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { data } = await apiClient.get('/farming/data');
      setFarmingData(data);
    } catch (err) {
      setError('Не удалось загрузить данные фарминга');
      console.error('[Farming] Ошибка загрузки данных:', err);
      addNotification('error', 'Не удалось загрузить данные фарминга');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartFarming = async () => {
    try {
      setError(null);
      await apiClient.post('/farming/start', { amount: parseFloat(amount) });
      addNotification('success', 'Фарминг успешно запущен');
      await fetchFarmingData();
      setAmount('');
    } catch (err) {
      setError('Не удалось начать фарминг');
      console.error('[Farming] Ошибка начала фарминга:', err);
      addNotification('error', 'Не удалось начать фарминг');
    }
  };

  const handleStopFarming = async () => {
    try {
      setError(null);
      await apiClient.post('/farming/stop');
      addNotification('info', 'Фарминг остановлен');
      await fetchFarmingData();
    } catch (err) {
      setError('Не удалось остановить фарминг');
      console.error('[Farming] Ошибка остановки фарминга:', err);
      addNotification('error', 'Не удалось остановить фарминг');
    }
  };

  const handleClaimRewards = async () => {
    try {
      setError(null);
      await apiClient.post('/farming/claim');
      addNotification('success', `Получено ${farmingData?.rewards.toFixed(2)} UNI`);
      await fetchFarmingData();
    } catch (err) {
      setError('Не удалось получить награды');
      console.error('[Farming] Ошибка получения наград:', err);
      addNotification('error', 'Не удалось получить награды');
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
      {/* Farming Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Фарминг</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Статус:</span>
            <span className={`font-semibold ${farmingData?.isActive ? 'text-green-600' : 'text-red-600'}`}>
              {farmingData?.isActive ? 'Активен' : 'Неактивен'}
            </span>
          </div>
          {farmingData?.isActive && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Начало:</span>
                <span className="font-semibold">
                  {new Date(farmingData.startTime!).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Сумма:</span>
                <span className="font-semibold">{farmingData.amount} UNI</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Дневная ставка:</span>
                <span className="font-semibold">{farmingData.dailyRate}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Награды:</span>
                <span className="font-semibold">{farmingData.rewards.toFixed(2)} UNI</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Farming Controls */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Управление</h3>
        {!farmingData?.isActive ? (
          <div className="space-y-4">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                Сумма для фарминга (UNI)
              </label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Введите сумму"
                min="0"
                step="0.01"
              />
            </div>
            <button
              onClick={handleStartFarming}
              disabled={!amount || parseFloat(amount) <= 0}
              className="w-full bg-blue-600 text-white rounded-lg py-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Начать фарминг
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <button
              onClick={handleStopFarming}
              className="w-full bg-red-600 text-white rounded-lg py-2 hover:bg-red-700"
            >
              Остановить фарминг
            </button>
            {farmingData.rewards > 0 && (
              <button
                onClick={handleClaimRewards}
                className="w-full bg-green-600 text-white rounded-lg py-2 hover:bg-green-700"
              >
                Получить награды ({farmingData.rewards.toFixed(2)} UNI)
              </button>
            )}
          </div>
        )}
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