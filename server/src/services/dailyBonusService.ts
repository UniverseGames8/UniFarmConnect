import { db } from '../db';
import { users, transactions } from '../db/schema';
import { eq, and, desc } from 'drizzle-orm';

export class DailyBonusService {
  /**
   * Получить информацию о ежедневном бонусе пользователя
   */
  static async getDailyBonusInfo(userId: string): Promise<any> {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, parseInt(userId)))
        .limit(1);

      if (!user) {
        throw new Error('Пользователь не найден');
      }

      const currentStreak = user.checkin_streak || 0;
      const lastClaimDate = user.checkin_last_date;
      const now = new Date();
      const nextAvailableClaim = lastClaimDate 
        ? new Date(lastClaimDate.getTime() + 24 * 60 * 60 * 1000)
        : now;

      return {
        current_streak: currentStreak,
        max_streak: 7,
        last_claim_date: lastClaimDate?.toISOString() || null,
        next_available_claim: nextAvailableClaim.toISOString(),
        can_claim_today: !lastClaimDate || new Date(lastClaimDate).toISOString().split('T')[0] !== now.toISOString().split('T')[0],
        today_bonus_amount: this.calculateBonusAmount(currentStreak).toString(),
        streak_multiplier: this.calculateStreakMultiplier(currentStreak),
        total_claimed: await this.getTotalClaimedAmount(userId)
      };
    } catch (error) {
      console.error('[DailyBonusService] Ошибка получения информации о бонусе:', error);
      throw error;
    }
  }

  /**
   * Забрать ежедневный бонус
   */
  static async claimDailyBonus(userId: string): Promise<any> {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, parseInt(userId)))
        .limit(1);

      if (!user) {
        throw new Error('Пользователь не найден');
      }

      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const lastCheckin = user.checkin_last_date 
        ? new Date(user.checkin_last_date).toISOString().split('T')[0] 
        : null;

      if (lastCheckin === today) {
        throw new Error('Бонус уже получен сегодня');
      }

      // Рассчитываем новую серию
      let newStreak = 1;
      if (lastCheckin) {
        const lastCheckinDate = new Date(lastCheckin);
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (lastCheckin === yesterdayStr) {
          newStreak = (user.checkin_streak || 0) + 1;
        }
      }

      const bonusAmount = this.calculateBonusAmount(newStreak);
      const streakMultiplier = this.calculateStreakMultiplier(newStreak);

      // Обновляем данные пользователя
      const newBalance = (parseFloat(user.balance_uni || "0") + bonusAmount).toString();
      
      await db
        .update(users)
        .set({
          balance_uni: newBalance,
          checkin_last_date: now,
          checkin_streak: newStreak
        })
        .where(eq(users.id, parseInt(userId)));

      // Записываем транзакцию
      await db
        .insert(transactions)
        .values({
          user_id: parseInt(userId),
          type: 'daily_bonus',
          amount: bonusAmount.toString(),
          currency: 'UNI',
          status: 'completed'
        });

      return {
        claimed: true,
        bonus_amount: bonusAmount.toString(),
        new_streak: newStreak,
        next_claim_available: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
        streak_bonus_percentage: (streakMultiplier - 1) * 100
      };
    } catch (error) {
      console.error('[DailyBonusService] Ошибка получения бонуса:', error);
      throw error;
    }
  }

  /**
   * Получить календарь ежедневных бонусов
   */
  static async getDailyBonusCalendar(userId: string, month: number, year: number): Promise<any> {
    try {
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0);

      const history = await db
        .select()
        .from(transactions)
        .where(and(
          eq(transactions.user_id, parseInt(userId)),
          eq(transactions.type, 'daily_bonus')
        ))
        .where(transactions.created_at >= startDate)
        .where(transactions.created_at <= endDate)
        .orderBy(transactions.created_at);

      const days = [];
      const currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const claim = history.find(tx => 
          new Date(tx.created_at).toISOString().split('T')[0] === dateStr
        );

        days.push({
          date: dateStr,
          claimed: !!claim,
          amount: claim ? claim.amount : null
        });

        currentDate.setDate(currentDate.getDate() + 1);
      }

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, parseInt(userId)))
        .limit(1);

      return {
        month,
        year,
        days,
        total_claimed_this_month: history.reduce((sum, tx) => sum + parseFloat(tx.amount), 0).toString(),
        days_claimed: history.length,
        current_streak: user?.checkin_streak || 0
      };
    } catch (error) {
      console.error('[DailyBonusService] Ошибка получения календаря:', error);
      throw error;
    }
  }

  /**
   * Получить статистику ежедневных бонусов
   */
  static async getDailyBonusStats(userId: string): Promise<any> {
    try {
      const history = await db
        .select()
        .from(transactions)
        .where(and(
          eq(transactions.user_id, parseInt(userId)),
          eq(transactions.type, 'daily_bonus')
        ))
        .orderBy(desc(transactions.created_at));

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, parseInt(userId)))
        .limit(1);

      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());

      const thisMonthClaims = history.filter(tx => new Date(tx.created_at) >= monthStart);
      const thisWeekClaims = history.filter(tx => new Date(tx.created_at) >= weekStart);

      return {
        total_days_claimed: history.length,
        total_amount_claimed: history.reduce((sum, tx) => sum + parseFloat(tx.amount), 0).toString(),
        current_streak: user?.checkin_streak || 0,
        max_streak_achieved: user?.max_checkin_streak || 0,
        average_daily_bonus: (history.reduce((sum, tx) => sum + parseFloat(tx.amount), 0) / history.length || 0).toString(),
        this_month_claimed: thisMonthClaims.reduce((sum, tx) => sum + parseFloat(tx.amount), 0).toString(),
        this_week_claimed: thisWeekClaims.reduce((sum, tx) => sum + parseFloat(tx.amount), 0).toString(),
        streak_bonuses_earned: history.reduce((sum, tx) => {
          const baseAmount = 10; // Базовый бонус
          const claimedAmount = parseFloat(tx.amount);
          return sum + (claimedAmount - baseAmount);
        }, 0).toString()
      };
    } catch (error) {
      console.error('[DailyBonusService] Ошибка получения статистики:', error);
      throw error;
    }
  }

  /**
   * Проверить доступность ежедневного бонуса
   */
  static async checkDailyBonusAvailability(userId: string): Promise<any> {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, parseInt(userId)))
        .limit(1);

      if (!user) {
        throw new Error('Пользователь не найден');
      }

      const now = new Date();
      const lastCheckin = user.checkin_last_date;
      const canClaim = !lastCheckin || 
        new Date(lastCheckin).toISOString().split('T')[0] !== now.toISOString().split('T')[0];

      const nextClaimTime = lastCheckin 
        ? new Date(lastCheckin.getTime() + 24 * 60 * 60 * 1000)
        : now;

      const timeUntilNextClaim = canClaim ? 0 : nextClaimTime.getTime() - now.getTime();

      return {
        can_claim: canClaim,
        time_until_next_claim: timeUntilNextClaim,
        next_claim_time: nextClaimTime.toISOString(),
        current_bonus_amount: this.calculateBonusAmount(user.checkin_streak || 0).toString(),
        streak_multiplier: this.calculateStreakMultiplier(user.checkin_streak || 0)
      };
    } catch (error) {
      console.error('[DailyBonusService] Ошибка проверки доступности:', error);
      throw error;
    }
  }

  /**
   * Рассчитать сумму бонуса с учетом серии
   */
  private static calculateBonusAmount(streak: number): number {
    const baseBonus = 10;
    const streakBonus = Math.min((streak - 1) * 2, 20);
    return baseBonus + streakBonus;
  }

  /**
   * Рассчитать множитель серии
   */
  private static calculateStreakMultiplier(streak: number): number {
    return 1 + (Math.min(streak - 1, 10) * 0.1);
  }

  /**
   * Получить общую сумму полученных бонусов
   */
  private static async getTotalClaimedAmount(userId: string): Promise<string> {
    try {
      const result = await db
        .select()
        .from(transactions)
        .where(and(
          eq(transactions.user_id, parseInt(userId)),
          eq(transactions.type, 'daily_bonus')
        ));

      return result.reduce((sum, tx) => sum + parseFloat(tx.amount), 0).toString();
    } catch (error) {
      console.error('[DailyBonusService] Ошибка получения общей суммы:', error);
      return "0";
    }
  }
} 