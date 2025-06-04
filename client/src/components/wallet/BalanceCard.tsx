import React, { useEffect, useState } from 'react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { formatTonNumber } from '@/utils/formatters';
import { useNotification } from '@/contexts/notificationContext';
import useWebSocket from '@/hooks/useWebSocket';
import { fetchBalance } from '@/services/balanceService';
import { useUser } from '@/contexts/userContext';

/**
 * Компонент карточки баланса согласно UX спецификации
 * Отображает UNI и TON балансы с правильными градиентами и визуальными эффектами
 */
const BalanceCard: React.FC = () => {
  const [tonConnectUI] = useTonConnectUI();
  const queryClient = useQueryClient();
  const { isConnected } = useWebSocket();
  const { showNotification } = useNotification();
  const { userId } = useUser();

  const { data: balance, isLoading } = useQuery({
    queryKey: ['balance', userId],
    queryFn: () => fetchBalance(userId || 0),
    enabled: !!userId
  });

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [wsErrorNotificationShown, setWsErrorNotificationShown] = useState(false);

  useEffect(() => {
    if (isConnected) {
      setWsErrorNotificationShown(false);
    } else if (!wsErrorNotificationShown) {
      showNotification({
        type: 'error',
        message: 'Ошибка подключения к серверу'
      });
      setWsErrorNotificationShown(true);
    }
  }, [isConnected, showNotification]);

  const handleRefresh = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    setRefreshError(null);
    
    try {
      await queryClient.invalidateQueries({ queryKey: ['balance', userId] });
      setLastRefreshTime(new Date());
    } catch (error) {
      setRefreshError('Ошибка при обновлении баланса');
      showNotification({
        type: 'error',
        message: 'Ошибка при обновлении баланса'
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const getUsdValue = (balance: number) => {
    const usdValue = balance * 2.5; // Примерная цена TON в USD
    return formatTonNumber(usdValue, 2);
  };

  if (isLoading) {
  return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex justify-center items-center h-24">
          <span className="text-gray-500">Загрузка баланса...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Баланс TON</h2>
          <button 
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
        >
          {isRefreshing ? 'Обновление...' : 'Обновить'}
          </button>
        </div>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600">Баланс:</span>
          <span className="font-medium">{formatTonNumber(balance?.tonBalance || 0)} TON</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">В USD:</span>
          <span className="font-medium">${getUsdValue(balance?.tonBalance || 0)}</span>
        </div>
      </div>
      
      {refreshError && (
        <div className="mt-2 text-red-600 text-sm">
          {refreshError}
          </div>
      )}

      {lastRefreshTime && (
        <div className="mt-2 text-gray-500 text-sm">
          Последнее обновление: {lastRefreshTime.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};

export default BalanceCard;