import { db } from '../db';
import { users, transactions } from '../db/schema';
import { eq, desc } from 'drizzle-orm';

export class WalletService {
  /**
   * Получение данных кошелька
   */
  static async getWalletData(userId: number): Promise<{
    uni_balance: string;
    ton_balance: string;
    total_earned: string;
    total_spent: string;
    transactions: any[];
  }> {
    try {
      console.log('[WalletService] Получение данных кошелька:', { user_id: userId });

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user) {
        console.log('[WalletService] Пользователь не найден:', { user_id: userId });
        return {
          uni_balance: '0',
          ton_balance: '0',
          total_earned: '0',
          total_spent: '0',
          transactions: []
        };
      }

      // Получаем последние транзакции пользователя
      const userTransactions = await db
        .select()
        .from(transactions)
        .where(eq(transactions.user_id, userId))
        .orderBy(desc(transactions.created_at))
        .limit(10);

      // Рассчитываем общие суммы
      const totalEarned = userTransactions
        .filter(tx => tx.type === 'deposit' || tx.type === 'reward')
        .reduce((sum, tx) => sum + parseFloat(tx.amount), 0);

      const totalSpent = userTransactions
        .filter(tx => tx.type === 'withdrawal')
        .reduce((sum, tx) => sum + parseFloat(tx.amount), 0);

      const result = {
        uni_balance: user.balance_uni || '0',
        ton_balance: user.balance_ton || '0',
        total_earned: totalEarned.toString(),
        total_spent: totalSpent.toString(),
        transactions: userTransactions.map(tx => ({
          id: tx.id,
          type: tx.type,
          amount: tx.amount,
          currency: tx.currency,
          description: tx.description,
          date: tx.created_at,
          status: tx.status
        }))
      };

      console.log('[WalletService] Данные кошелька получены:', {
        user_id: userId,
        result
      });

      return result;
    } catch (error) {
      console.error('[WalletService] Ошибка получения данных кошелька:', error);
      throw error;
    }
  }

  /**
   * Получение истории транзакций
   */
  static async getTransactionHistory(
    userId: number,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    transactions: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      has_more: boolean;
    };
  }> {
    try {
      console.log('[WalletService] Получение истории транзакций:', {
        user_id: userId,
        page,
        limit
      });

      const offset = (page - 1) * limit;
      
      const userTransactions = await db
        .select()
        .from(transactions)
        .where(eq(transactions.user_id, userId))
        .orderBy(desc(transactions.created_at))
        .limit(limit)
        .offset(offset);

      const result = {
        transactions: userTransactions.map(tx => ({
          id: tx.id,
          type: tx.type,
          amount: tx.amount,
          currency: tx.currency,
          description: tx.description,
          date: tx.created_at,
          status: tx.status
        })),
        pagination: {
          page,
          limit,
          total: userTransactions.length,
          has_more: userTransactions.length === limit
        }
      };

      console.log('[WalletService] История транзакций получена:', {
        user_id: userId,
        total: result.pagination.total
      });

      return result;
    } catch (error) {
      console.error('[WalletService] Ошибка получения истории транзакций:', error);
      throw error;
    }
  }

  /**
   * Обработка вывода средств
   */
  static async processWithdrawal(
    userId: number,
    data: {
      amount: string;
      currency: 'UNI' | 'TON';
      wallet_address: string;
    }
  ): Promise<{
    success: boolean;
    transaction_id?: string;
    error?: string;
  }> {
    try {
      console.log('[WalletService] Обработка вывода средств:', {
        user_id: userId,
        amount: data.amount,
        currency: data.currency
      });

      // Получаем текущий баланс пользователя
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user) {
        console.log('[WalletService] Пользователь не найден:', { user_id: userId });
        return {
          success: false,
          error: 'Пользователь не найден'
        };
      }

      const balance = data.currency === 'UNI' ? user.balance_uni : user.balance_ton;
      const amount = parseFloat(data.amount);

      if (parseFloat(balance) < amount) {
        console.log('[WalletService] Недостаточно средств:', {
          user_id: userId,
          balance,
          required: amount
        });
        return {
          success: false,
          error: 'Недостаточно средств'
        };
      }

      // Создаем транзакцию вывода
      const [transaction] = await db
        .insert(transactions)
        .values({
          user_id: userId,
          type: 'withdrawal',
          currency: data.currency,
          amount: data.amount,
          description: `Вывод ${data.amount} ${data.currency} на адрес ${data.wallet_address}`,
          status: 'pending'
        })
        .returning();

      // Обновляем баланс пользователя
      const newBalance = (parseFloat(balance) - amount).toString();
      await db
        .update(users)
        .set({
          [data.currency === 'UNI' ? 'balance_uni' : 'balance_ton']: newBalance
        })
        .where(eq(users.id, userId));

      console.log('[WalletService] Вывод средств обработан:', {
        user_id: userId,
        transaction_id: transaction.id,
        amount: data.amount,
        currency: data.currency
      });

      return {
        success: true,
        transaction_id: transaction.id.toString()
      };
    } catch (error) {
      console.error('[WalletService] Ошибка обработки вывода средств:', error);
      throw error;
    }
  }
}; 