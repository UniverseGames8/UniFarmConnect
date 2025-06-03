import { db } from '../db';
import { users, transactions, userBoosts, referrals } from '../db/schema';
import { eq, and, desc, sql, like, or } from 'drizzle-orm';

interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
}

interface TransactionParams extends PaginationParams {
  type?: string;
  status?: string;
}

export class AdminService {
  /**
   * Получить статистику системы
   */
  static async getSystemStats(): Promise<{
    total_users: number;
    active_users: number;
    total_transactions: number;
    total_volume_uni: string;
    total_volume_ton: string;
    active_boosts: number;
    total_referrals: number;
  }> {
    try {
      console.log('[AdminService] Получение статистики системы');

      // Общее количество пользователей
      const [totalUsers] = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(users);

      // Активные пользователи (были активны за последние 30 дней)
      const [activeUsers] = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(users)
        .where(sql`${users.last_active} > NOW() - INTERVAL '30 days'`);

      // Общее количество транзакций
      const [totalTransactions] = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(transactions);

      // Общий объем транзакций в UNI
      const [totalVolumeUni] = await db
        .select({ total: sql<string>`COALESCE(SUM(${transactions.amount}), '0')` })
        .from(transactions)
        .where(eq(transactions.currency, 'UNI'));

      // Общий объем транзакций в TON
      const [totalVolumeTon] = await db
        .select({ total: sql<string>`COALESCE(SUM(${transactions.amount}), '0')` })
        .from(transactions)
        .where(eq(transactions.currency, 'TON'));

      // Активные бусты
      const [activeBoosts] = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(userBoosts)
        .where(eq(userBoosts.is_active, true));

      // Общее количество рефералов
      const [totalReferrals] = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(referrals);

      return {
        total_users: Number(totalUsers?.count || 0),
        active_users: Number(activeUsers?.count || 0),
        total_transactions: Number(totalTransactions?.count || 0),
        total_volume_uni: totalVolumeUni?.total || '0',
        total_volume_ton: totalVolumeTon?.total || '0',
        active_boosts: Number(activeBoosts?.count || 0),
        total_referrals: Number(totalReferrals?.count || 0)
      };
    } catch (error) {
      console.error('[AdminService] Ошибка получения статистики системы:', error);
      throw error;
    }
  }

  /**
   * Получить список пользователей
   */
  static async getUsers({ page, limit, search }: PaginationParams): Promise<{
    users: Array<{
      id: number;
      telegram_id: string | null;
      username: string | null;
      balance_uni: string;
      balance_ton: string;
      ref_code: string | null;
      last_active: Date | null;
      created_at: Date;
    }>;
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      console.log(`[AdminService] Получение списка пользователей (страница ${page}, лимит ${limit})`);

      const offset = (page - 1) * limit;

      // Базовый запрос
      let query = db
        .select({
          id: users.id,
          telegram_id: users.telegram_id,
          username: users.username,
          balance_uni: users.balance_uni,
          balance_ton: users.balance_ton,
          ref_code: users.ref_code,
          last_active: users.last_active,
          created_at: users.created_at
        })
        .from(users);

      // Добавляем поиск, если указан
      if (search) {
        query = query.where(
          or(
            like(users.username, `%${search}%`),
            like(users.telegram_id, `%${search}%`),
            like(users.ref_code, `%${search}%`)
          )
        );
      }

      // Получаем общее количество
      const [total] = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(users);

      // Получаем данные с пагинацией
      const userList = await query
        .orderBy(desc(users.created_at))
        .limit(limit)
        .offset(offset);

      return {
        users: userList,
        total: Number(total?.count || 0),
        page,
        limit
      };
    } catch (error) {
      console.error('[AdminService] Ошибка получения списка пользователей:', error);
      throw error;
    }
  }

  /**
   * Получить детальную информацию о пользователе
   */
  static async getUserDetails(userId: string): Promise<{
    user: {
      id: number;
      telegram_id: string | null;
      username: string | null;
      balance_uni: string;
      balance_ton: string;
      ref_code: string | null;
      parent_ref_code: string | null;
      uni_farming_balance: string;
      uni_farming_rate: string;
      checkin_streak: number;
      last_active: Date | null;
      created_at: Date;
    };
    stats: {
      total_transactions: number;
      total_earned_uni: string;
      total_earned_ton: string;
      active_boosts: number;
      total_referrals: number;
    };
  }> {
    try {
      console.log(`[AdminService] Получение деталей пользователя ${userId}`);

      // Получаем информацию о пользователе
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, parseInt(userId)))
        .limit(1);

      if (!user) {
        throw new Error('Пользователь не найден');
      }

      // Получаем статистику пользователя
      const [totalTransactions] = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(transactions)
        .where(eq(transactions.user_id, parseInt(userId)));

      const [totalEarnedUni] = await db
        .select({ total: sql<string>`COALESCE(SUM(${transactions.amount}), '0')` })
        .from(transactions)
        .where(and(
          eq(transactions.user_id, parseInt(userId)),
          eq(transactions.currency, 'UNI'),
          eq(transactions.type, 'earn')
        ));

      const [totalEarnedTon] = await db
        .select({ total: sql<string>`COALESCE(SUM(${transactions.amount}), '0')` })
        .from(transactions)
        .where(and(
          eq(transactions.user_id, parseInt(userId)),
          eq(transactions.currency, 'TON'),
          eq(transactions.type, 'earn')
        ));

      const [activeBoosts] = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(userBoosts)
        .where(and(
          eq(userBoosts.user_id, parseInt(userId)),
          eq(userBoosts.is_active, true)
        ));

      const [totalReferrals] = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(referrals)
        .where(eq(referrals.user_id, parseInt(userId)));

      return {
        user,
        stats: {
          total_transactions: Number(totalTransactions?.count || 0),
          total_earned_uni: totalEarnedUni?.total || '0',
          total_earned_ton: totalEarnedTon?.total || '0',
          active_boosts: Number(activeBoosts?.count || 0),
          total_referrals: Number(totalReferrals?.count || 0)
        }
      };
    } catch (error) {
      console.error('[AdminService] Ошибка получения деталей пользователя:', error);
      throw error;
    }
  }

  /**
   * Обновить настройки пользователя
   */
  static async updateUserSettings(userId: string, settings: {
    balance_uni?: string;
    balance_ton?: string;
    uni_farming_rate?: string;
    is_active?: boolean;
  }): Promise<{
    id: number;
    telegram_id: string | null;
    username: string | null;
    balance_uni: string;
    balance_ton: string;
    uni_farming_rate: string;
    is_active: boolean;
  }> {
    try {
      console.log(`[AdminService] Обновление настроек пользователя ${userId}`);

      const [updatedUser] = await db
        .update(users)
        .set({
          ...settings,
          updated_at: new Date()
        })
        .where(eq(users.id, parseInt(userId)))
        .returning();

      if (!updatedUser) {
        throw new Error('Пользователь не найден');
      }

      return {
        id: updatedUser.id,
        telegram_id: updatedUser.telegram_id,
        username: updatedUser.username,
        balance_uni: updatedUser.balance_uni,
        balance_ton: updatedUser.balance_ton,
        uni_farming_rate: updatedUser.uni_farming_rate,
        is_active: updatedUser.is_active ?? true
      };
    } catch (error) {
      console.error('[AdminService] Ошибка обновления настроек пользователя:', error);
      throw error;
    }
  }

  /**
   * Получить список транзакций
   */
  static async getTransactions({ page, limit, type, status }: TransactionParams): Promise<{
    transactions: Array<{
      id: number;
      user_id: number;
      type: string;
      amount: string;
      currency: string;
      status: string;
      created_at: Date;
    }>;
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      console.log(`[AdminService] Получение списка транзакций (страница ${page}, лимит ${limit})`);

      const offset = (page - 1) * limit;

      // Базовый запрос
      let query = db
        .select()
        .from(transactions);

      // Добавляем фильтры
      if (type) {
        query = query.where(eq(transactions.type, type));
      }
      if (status) {
        query = query.where(eq(transactions.status, status));
      }

      // Получаем общее количество
      const [total] = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(transactions);

      // Получаем данные с пагинацией
      const transactionList = await query
        .orderBy(desc(transactions.created_at))
        .limit(limit)
        .offset(offset);

      return {
        transactions: transactionList,
        total: Number(total?.count || 0),
        page,
        limit
      };
    } catch (error) {
      console.error('[AdminService] Ошибка получения списка транзакций:', error);
      throw error;
    }
  }

  /**
   * Обновить статус транзакции
   */
  static async updateTransactionStatus(transactionId: string, status: string): Promise<{
    id: number;
    user_id: number;
    type: string;
    amount: string;
    currency: string;
    status: string;
    created_at: Date;
  }> {
    try {
      console.log(`[AdminService] Обновление статуса транзакции ${transactionId} на ${status}`);

      const [updatedTransaction] = await db
        .update(transactions)
        .set({
          status,
          updated_at: new Date()
        })
        .where(eq(transactions.id, parseInt(transactionId)))
        .returning();

      if (!updatedTransaction) {
        throw new Error('Транзакция не найдена');
      }

      return updatedTransaction;
    } catch (error) {
      console.error('[AdminService] Ошибка обновления статуса транзакции:', error);
      throw error;
    }
  }
} 