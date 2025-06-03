import { db } from '../db';
import { users, referrals } from '../db/schema';
import { eq, sql } from 'drizzle-orm';

export class ReferralService {
  /**
   * Генерирует уникальный реферальный код для пользователя
   */
  static async generateReferralCode(userId: string): Promise<string> {
    try {
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 8).toUpperCase();
      const refCode = `${userId.slice(-4)}${random}${timestamp.toString().slice(-4)}`;
      
      console.log(`[ReferralService] Генерация реферального кода для пользователя ${userId}: ${refCode}`);
      return refCode;
    } catch (error) {
      console.error('[ReferralService] Ошибка генерации реферального кода:', error);
      throw error;
    }
  }

  /**
   * Обрабатывает реферальную связь между пользователями
   */
  static async processReferral(refCode: string, newUserId: string): Promise<boolean> {
    try {
      // Находим пользователя с таким реферальным кодом
      const [inviter] = await db
        .select()
        .from(users)
        .where(eq(users.ref_code, refCode))
        .limit(1);

      if (!inviter) return false;

      // Обновляем нового пользователя, указывая родительский реферальный код
      await db
        .update(users)
        .set({ parent_ref_code: refCode })
        .where(eq(users.id, parseInt(newUserId)));

      // Создаем запись о реферальной связи
      await db
        .insert(referrals)
        .values({
          user_id: parseInt(newUserId),
          inviter_id: inviter.id,
          level: 1,
          reward_uni: "10", // Базовая награда за приглашение
          created_at: new Date()
        });

      return true;
    } catch (error) {
      console.error('[ReferralService] Ошибка обработки реферала:', error);
      return false;
    }
  }

  /**
   * Получает статистику рефералов для пользователя
   */
  static async getReferralStats(userId: string): Promise<{
    referrals: number;
    earnings: string;
    total_invited: number;
    active_referrals: number;
  }> {
    try {
      // Получаем пользователя и его реферальный код
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, parseInt(userId)))
        .limit(1);

      if (!user || !user.ref_code) {
        return { referrals: 0, earnings: "0", total_invited: 0, active_referrals: 0 };
      }

      // Считаем всех приглашенных пользователей
      const invitedUsers = await db
        .select()
        .from(users)
        .where(eq(users.parent_ref_code, user.ref_code));

      // Считаем общий доход от рефералов
      const [earnings] = await db
        .select({ total: sql<string>`COALESCE(SUM(${referrals.reward_uni}), '0')` })
        .from(referrals)
        .where(eq(referrals.inviter_id, parseInt(userId)));

      return {
        referrals: invitedUsers.length,
        earnings: earnings?.total || "0",
        total_invited: invitedUsers.length,
        active_referrals: invitedUsers.filter(u => u.created_at && 
          (new Date().getTime() - new Date(u.created_at).getTime()) < 30 * 24 * 60 * 60 * 1000
        ).length
      };
    } catch (error) {
      console.error('[ReferralService] Ошибка получения статистики рефералов:', error);
      throw error;
    }
  }

  /**
   * Валидирует реферальный код
   */
  static async validateReferralCode(refCode: string): Promise<boolean> {
    try {
      if (!refCode || refCode.length < 6) {
        return false;
      }

      // Проверяем существование пользователя с таким реферальным кодом
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.ref_code, refCode))
        .limit(1);

      return !!user;
    } catch (error) {
      console.error('[ReferralService] Ошибка валидации реферального кода:', error);
      return false;
    }
  }

  /**
   * Получает список рефералов пользователя
   */
  static async getUserReferrals(userId: string, page: number, limit: number): Promise<{
    items: Array<{
      id: number;
      referred_user_id: string;
      referred_username: string;
      referred_at: string;
      earnings_from_referral: string;
      is_active: boolean;
    }>;
    total: number;
    hasMore: boolean;
  }> {
    try {
      const offset = (page - 1) * limit;

      // Получаем рефералов с пагинацией
      const referralsList = await db
        .select({
          id: referrals.id,
          referred_user_id: users.id,
          referred_username: users.username,
          referred_at: referrals.created_at,
          earnings_from_referral: referrals.reward_uni,
          is_active: sql<boolean>`CASE 
            WHEN ${users.last_active} > NOW() - INTERVAL '30 days' THEN true 
            ELSE false 
          END`
        })
        .from(referrals)
        .leftJoin(users, eq(referrals.user_id, users.id))
        .where(eq(referrals.inviter_id, parseInt(userId)))
        .limit(limit)
        .offset(offset);

      // Получаем общее количество рефералов
      const [{ totalCount }] = await db
        .select({ totalCount: sql<number>`COUNT(*)` })
        .from(referrals)
        .where(eq(referrals.inviter_id, parseInt(userId)));

      return {
        items: referralsList.map(r => ({
          id: r.id,
          referred_user_id: r.referred_user_id?.toString() || '',
          referred_username: r.referred_username || '',
          referred_at: r.referred_at?.toISOString() || new Date().toISOString(),
          earnings_from_referral: r.earnings_from_referral || '0',
          is_active: r.is_active
        })),
        total: Number(totalCount),
        hasMore: offset + referralsList.length < Number(totalCount)
      };
    } catch (error) {
      console.error('[ReferralService] Ошибка получения списка рефералов:', error);
      throw error;
    }
  }

  /**
   * Получает статистику доходов от рефералов
   */
  static async getReferralEarnings(userId: string, period: string): Promise<{
    total_earnings: string;
    period_earnings: string;
    active_referrals: number;
    total_referrals: number;
    average_earnings_per_referral: string;
    last_payout: string | null;
  }> {
    try {
      const now = new Date();
      let periodStart: Date;

      switch (period) {
        case 'month':
          periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'week':
          periodStart = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'day':
          periodStart = new Date(now.setDate(now.getDate() - 1));
          break;
        default:
          periodStart = new Date(0);
      }

      // Получаем общий доход
      const [totalEarnings] = await db
        .select({ total: sql<string>`COALESCE(SUM(${referrals.reward_uni}), '0')` })
        .from(referrals)
        .where(eq(referrals.inviter_id, parseInt(userId)));

      // Получаем доход за период
      const [periodEarnings] = await db
        .select({ total: sql<string>`COALESCE(SUM(${referrals.reward_uni}), '0')` })
        .from(referrals)
        .where(sql`${referrals.inviter_id} = ${parseInt(userId)} AND ${referrals.created_at} >= ${periodStart}`);

      // Получаем количество активных рефералов
      const [activeReferrals] = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(referrals)
        .leftJoin(users, eq(referrals.user_id, users.id))
        .where(sql`${referrals.inviter_id} = ${parseInt(userId)} AND ${users.last_active} > NOW() - INTERVAL '30 days'`);

      // Получаем общее количество рефералов
      const [totalReferrals] = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(referrals)
        .where(eq(referrals.inviter_id, parseInt(userId)));

      // Получаем последнюю выплату
      const [lastPayout] = await db
        .select({ created_at: referrals.created_at })
        .from(referrals)
        .where(eq(referrals.inviter_id, parseInt(userId)))
        .orderBy(sql`${referrals.created_at} DESC`)
        .limit(1);

      const total = Number(totalEarnings?.total || 0);
      const periodTotal = Number(periodEarnings?.total || 0);
      const totalRefs = Number(totalReferrals?.count || 0);

      return {
        total_earnings: total.toFixed(2),
        period_earnings: periodTotal.toFixed(2),
        active_referrals: Number(activeReferrals?.count || 0),
        total_referrals: totalRefs,
        average_earnings_per_referral: totalRefs > 0 ? (total / totalRefs).toFixed(2) : "0",
        last_payout: lastPayout?.created_at?.toISOString() || null
      };
    } catch (error) {
      console.error('[ReferralService] Ошибка получения доходов от рефералов:', error);
      throw error;
    }
  }
} 