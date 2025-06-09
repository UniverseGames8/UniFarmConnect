import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@/contexts/userContext';
import { useNotification } from '@/contexts/notificationContext';
import { formatNumberWithPrecision } from '@/utils/formatters';
import { Button } from '@/components/ui/button';
import { RefreshCw, Filter } from 'lucide-react';

// Типы транзакций согласно схеме базы данных
interface Transaction {
  id: number;
  user_id: number;
  type: 'deposit' | 'withdrawal' | 'farming_reward' | 'referral_bonus' | 'mission_reward' | 'boost_purchase';
  amount: string;
  currency: 'UNI' | 'TON';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  transaction_hash?: string;
  wallet_address?: string;
  description?: string;
  created_at: string;
  updated_at?: string;
}

type TransactionFilter = 'ALL' | 'DEPOSIT' | 'WITHDRAWAL' | 'BONUS' | 'REFERRAL';

/**
 * Компонент истории транзакций согласно UX спецификации
 * Отображает все транзакции пользователя с фильтрацией и анимацией
 */
const TransactionHistory: React.FC = () => {
  // Состояние для активного фильтра
  const [filter, setFilter] = useState<TransactionFilter>('ALL');
  
  // Состояние для пагинации
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  
  // Получаем данные пользователя из контекста
  const { userId } = useUser();
  
  // Получаем доступ к системе уведомлений
  const { showNotification } = useNotification();
  
  // Запрос транзакций
  const {
    data: transactionsData,
    isLoading,
    error,
    isFetching,
    refetch
  } = useQuery({
    queryKey: ['/api/transactions', userId, page, limit, filter],
    queryFn: async () => {
      if (!userId) return { transactions: [], total: 0 };
      
      try {
        const response = await fetch(`/api/transactions?user_id=${userId}&page=${page}&limit=${limit}&filter=${filter}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
      } catch (err) {
        console.error('[TransactionHistory] Ошибка загрузки транзакций:', err);
        return { transactions: [], total: 0 };
      }
    },
    enabled: !!userId,
    staleTime: 30000, // 30 секунд
    refetchInterval: 60000, // Обновляем каждую минуту
  });
  
  const transactions = transactionsData?.transactions || [];
  const totalTransactions = transactionsData?.total || 0;
  
  // Форматирование даты и времени
  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Форматирование суммы транзакции
  const formatTransactionAmount = (amount: string, currency: string): string => {
    const num = parseFloat(amount);
    if (currency === 'TON') {
      return num.toFixed(6);
    } else {
      return num.toFixed(2);
    }
  };
  
  // Получение иконки для типа транзакции
  const getTransactionIcon = (type: string): string => {
    switch (type) {
      case 'deposit':
        return 'fas fa-arrow-down text-green-400';
      case 'withdrawal':
        return 'fas fa-arrow-up text-red-400';
      case 'farming_reward':
        return 'fas fa-seedling text-yellow-400';
      case 'referral_bonus':
        return 'fas fa-users text-blue-400';
      case 'mission_reward':
        return 'fas fa-trophy text-purple-400';
      case 'boost_purchase':
        return 'fas fa-rocket text-orange-400';
      default:
        return 'fas fa-exchange-alt text-gray-400';
    }
  };
  
  // Получение цвета для статуса транзакции
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed':
        return 'text-green-400 bg-green-400/10';
      case 'pending':
        return 'text-yellow-400 bg-yellow-400/10';
      case 'failed':
        return 'text-red-400 bg-red-400/10';
      case 'cancelled':
        return 'text-gray-400 bg-gray-400/10';
      default:
        return 'text-gray-400 bg-gray-400/10';
    }
  };
  
  // Получение текста статуса на русском
  const getStatusText = (status: string): string => {
    switch (status) {
      case 'completed':
        return 'Завершено';
      case 'pending':
        return 'В обработке';
      case 'failed':
        return 'Ошибка';
      case 'cancelled':
        return 'Отменено';
      default:
        return status;
    }
  };
  
  // Получение описания типа транзакции на русском
  const getTypeDescription = (type: string): string => {
    switch (type) {
      case 'deposit':
        return 'Пополнение';
      case 'withdrawal':
        return 'Вывод средств';
      case 'farming_reward':
        return 'Награда за фарминг';
      case 'referral_bonus':
        return 'Реферальный бонус';
      case 'mission_reward':
        return 'Награда за миссию';
      case 'boost_purchase':
        return 'Покупка буста';
      default:
        return 'Операция';
    }
  };
  
  // Обработчик смены фильтра
  const handleFilterChange = (newFilter: TransactionFilter) => {
    setFilter(newFilter);
    setPage(1); // Сбрасываем пагинацию при смене фильтра
    
    showNotification({
      type: 'info',
      message: `Фильтр изменен на ${newFilter === 'ALL' ? 'Все транзакции' : newFilter}`
    });
  };
  
  // Обработчик обновления данных
  const handleRefresh = async () => {
    showNotification({
      type: 'info',
      message: 'Обновление истории транзакций...'
    });
    
    try {
      await refetch();
      showNotification({
        type: 'success',
        message: 'История транзакций обновлена'
      });
    } catch (error) {
      showNotification({
        type: 'error',
        message: 'Ошибка при обновлении истории транзакций'
      });
    }
  };
  
  // Обработчик загрузки следующей страницы
  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };
  
  if (error) {
    return (
      <div className="bg-card rounded-xl p-5 mb-5 shadow-lg">
        <div className="text-center text-red-400">
          <i className="fas fa-exclamation-triangle text-2xl mb-2"></i>
          <p>Ошибка загрузки истории транзакций</p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isFetching}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
            Попробовать снова
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">История транзакций</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isFetching}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
          Обновить
        </Button>
      </div>
      
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {(['ALL', 'DEPOSIT', 'WITHDRAWAL', 'BONUS', 'REFERRAL'] as TransactionFilter[]).map((filterType) => (
          <Button
            key={filterType}
            variant={filter === filterType ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterChange(filterType)}
          >
            <Filter className="w-4 h-4 mr-2" />
            {filterType === 'ALL' ? 'Все' : getTypeDescription(filterType as 'deposit' | 'withdrawal' | 'farming_reward' | 'referral_bonus' | 'mission_reward' | 'boost_purchase')}
          </Button>
        ))}
      </div>
      
        {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin" />
            </div>
        ) : transactions.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Нет транзакций для отображения
          </div>
        ) : (
        <div className="space-y-4">
          {transactions.map((transaction: Transaction) => (
            <div 
              key={transaction.id}
              className="bg-card rounded-lg p-4 shadow-sm border"
            >
              <div className="flex justify-between items-start">
                  <div>
                  <h3 className="font-medium">{getTypeDescription(transaction.type as 'deposit' | 'withdrawal' | 'farming_reward' | 'referral_bonus' | 'mission_reward' | 'boost_purchase')}</h3>
                  <p className="text-sm text-muted-foreground">
                      {formatDateTime(transaction.created_at)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {transaction.type === 'withdrawal' ? '-' : '+'}
                    {formatTransactionAmount(transaction.amount, transaction.currency)} {transaction.currency}
                  </p>
                  <p className={`text-sm ${getStatusColor(transaction.status)}`}>
                    {getStatusText(transaction.status)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;