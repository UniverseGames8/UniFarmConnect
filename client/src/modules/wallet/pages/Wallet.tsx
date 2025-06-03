import { useEffect, useState } from 'react';
import { apiClient } from '@/core/api/client';
import { useWebSocket } from '@/shared/context/WebSocketContext';
import { useNotification } from '@/shared/context/NotificationContext';

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'reward';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  timestamp: string;
  description: string;
}

interface WalletData {
  balance: number;
  pendingWithdrawals: number;
  totalEarned: number;
}

export const Wallet = () => {
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [withdrawalAddress, setWithdrawalAddress] = useState('');
  const { lastMessage } = useWebSocket();
  const { addNotification } = useNotification();

  useEffect(() => {
    fetchWalletData();
    fetchTransactions();
  }, []);

  // Обработка WebSocket сообщений
  useEffect(() => {
    if (lastMessage?.type === 'wallet_update') {
      const { balance, pendingWithdrawals } = lastMessage.data;
      setWalletData(prev => prev ? { ...prev, balance, pendingWithdrawals } : null);
      addNotification('info', 'Баланс обновлен');
    } else if (lastMessage?.type === 'transaction_update') {
      const newTransaction = lastMessage.data;
      setTransactions(prev => [newTransaction, ...prev]);
      
      if (newTransaction.type === 'withdrawal' && newTransaction.status === 'completed') {
        addNotification('success', 'Вывод средств успешно выполнен');
      }
    }
  }, [lastMessage, addNotification]);

  const fetchWalletData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { data } = await apiClient.get('/wallet/data');
      setWalletData(data);
    } catch (err) {
      setError('Не удалось загрузить данные кошелька');
      console.error('[Wallet] Ошибка загрузки данных:', err);
      addNotification('error', 'Не удалось загрузить данные кошелька');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const { data } = await apiClient.get('/wallet/transactions');
      setTransactions(data);
    } catch (err) {
      console.error('[Wallet] Ошибка загрузки транзакций:', err);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      await apiClient.post('/wallet/withdraw', {
        amount: parseFloat(withdrawalAmount),
        address: withdrawalAddress
      });
      addNotification('success', 'Запрос на вывод средств отправлен');
      setWithdrawalAmount('');
      setWithdrawalAddress('');
      fetchWalletData();
    } catch (err) {
      setError('Не удалось выполнить вывод средств');
      console.error('[Wallet] Ошибка вывода средств:', err);
      addNotification('error', 'Не удалось выполнить вывод средств');
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
      {/* Wallet Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Кошелек</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-500 mb-1">Баланс</div>
            <div className="text-2xl font-bold text-gray-900">
              {walletData?.balance.toFixed(2)} UNI
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-500 mb-1">В обработке</div>
            <div className="text-2xl font-bold text-gray-900">
              {walletData?.pendingWithdrawals.toFixed(2)} UNI
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-500 mb-1">Всего заработано</div>
            <div className="text-2xl font-bold text-gray-900">
              {walletData?.totalEarned.toFixed(2)} UNI
            </div>
          </div>
        </div>
      </div>

      {/* Withdrawal Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Вывод средств</h3>
        <form onSubmit={handleWithdraw} className="space-y-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Сумма (UNI)
            </label>
            <input
              type="number"
              id="amount"
              value={withdrawalAmount}
              onChange={(e) => setWithdrawalAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Введите сумму"
              min="0"
              step="0.01"
              required
            />
          </div>
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Адрес кошелька
            </label>
            <input
              type="text"
              id="address"
              value={withdrawalAddress}
              onChange={(e) => setWithdrawalAddress(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Введите адрес кошелька"
              required
            />
          </div>
          <button
            type="submit"
            disabled={!withdrawalAmount || !withdrawalAddress || parseFloat(withdrawalAmount) <= 0}
            className="w-full bg-blue-600 text-white rounded-lg py-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Вывести средства
          </button>
        </form>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">История транзакций</h3>
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between py-2 border-b border-gray-100">
              <div>
                <div className="font-medium text-gray-900">
                  {transaction.type === 'deposit' ? 'Пополнение' :
                   transaction.type === 'withdrawal' ? 'Вывод' : 'Награда'}
                </div>
                <div className="text-sm text-gray-500">{transaction.description}</div>
                <div className="text-xs text-gray-400">
                  {new Date(transaction.timestamp).toLocaleString()}
                </div>
              </div>
              <div className="text-right">
                <div className={`font-medium ${
                  transaction.type === 'deposit' || transaction.type === 'reward'
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}>
                  {transaction.type === 'withdrawal' ? '-' : '+'}{transaction.amount} UNI
                </div>
                <div className={`text-xs ${
                  transaction.status === 'completed'
                    ? 'text-green-600'
                    : transaction.status === 'pending'
                    ? 'text-yellow-600'
                    : 'text-red-600'
                }`}>
                  {transaction.status === 'completed' ? 'Выполнено' :
                   transaction.status === 'pending' ? 'В обработке' : 'Ошибка'}
                </div>
              </div>
            </div>
          ))}
        </div>
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