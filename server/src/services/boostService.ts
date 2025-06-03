import { db } from '../db';
import { boostPackages, userBoosts, users } from '../db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

export class BoostService {
  /**
   * Получить список доступных бустов
   */
  static async getAvailableBoosts(): Promise<Array<{
    id: number;
    name: string;
    description: string;
    price_uni: number;
    rate_multiplier: number;
    duration_days: number;
    is_active: boolean;
  }>> {
    try {
      console.log('[BoostService] Получение списка доступных бустов');

      const packages = await db
        .select()
        .from(boostPackages)
        .where(eq(boostPackages.is_active, true));

      return packages.map(pkg => ({
        id: pkg.id,
        name: pkg.name,
        description: pkg.description,
        price_uni: parseFloat(pkg.price_uni),
        rate_multiplier: parseFloat(pkg.rate_multiplier),
        duration_days: pkg.duration_days,
        is_active: pkg.is_active ?? true
      }));
    } catch (error) {
      console.error('[BoostService] Ошибка получения доступных бустов:', error);
      throw error;
    }
  }

  /**
   * Получить активные бусты пользователя
   */
  static async getUserBoosts(userId: string): Promise<Array<{
    id: number;
    package_id: number;
    package_name: string;
    amount: number;
    daily_rate: number;
    start_date: Date;
    end_date: Date;
    last_claim: Date | null;
    total_earned: number;
    is_active: boolean;
  }>> {
    try {
      console.log(`[BoostService] Получение активных бустов для пользователя ${userId}`);

      const activeBoosts = await db
        .select({
          id: userBoosts.id,
          package_id: userBoosts.package_id,
          amount: userBoosts.amount,
          daily_rate: userBoosts.daily_rate,
          start_date: userBoosts.start_date,
          end_date: userBoosts.end_date,
          last_claim: userBoosts.last_claim,
          total_earned: userBoosts.total_earned,
          package_name: boostPackages.name
        })
        .from(userBoosts)
        .leftJoin(boostPackages, eq(userBoosts.package_id, boostPackages.id))
        .where(and(
          eq(userBoosts.user_id, parseInt(userId)),
          eq(userBoosts.is_active, true)
        ))
        .orderBy(desc(userBoosts.created_at));

      return activeBoosts.map(boost => ({
        id: boost.id,
        package_id: boost.package_id,
        package_name: boost.package_name || '',
        amount: parseFloat(boost.amount),
        daily_rate: parseFloat(boost.daily_rate),
        start_date: boost.start_date,
        end_date: boost.end_date,
        last_claim: boost.last_claim,
        total_earned: parseFloat(boost.total_earned || '0'),
        is_active: new Date() < new Date(boost.end_date!)
      }));
    } catch (error) {
      console.error('[BoostService] Ошибка получения активных бустов:', error);
      throw error;
    }
  }

  /**
   * Активировать буст
   */
  static async activateBoost(userId: string, boostId: string): Promise<{
    id: number;
    package_id: number;
    amount: string;
    daily_rate: number;
    start_date: Date;
    end_date: Date;
    is_active: boolean;
  }> {
    try {
      console.log(`[BoostService] Активация буста ${boostId} для пользователя ${userId}`);

      // Проверяем существование пакета
      const [packageInfo] = await db
        .select()
        .from(boostPackages)
        .where(and(
          eq(boostPackages.id, parseInt(boostId)),
          eq(boostPackages.is_active, true)
        ))
        .limit(1);

      if (!packageInfo) {
        throw new Error('Буст не найден или неактивен');
      }

      // Проверяем баланс пользователя
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, parseInt(userId)))
        .limit(1);

      if (!user) {
        throw new Error('Пользователь не найден');
      }

      const userBalance = parseFloat(user.balance_uni);
      const requiredAmount = parseFloat(packageInfo.price_uni);

      if (userBalance < requiredAmount) {
        throw new Error('Недостаточно средств');
      }

      // Создаем буст
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + packageInfo.duration_days);

      const [newBoost] = await db
        .insert(userBoosts)
        .values({
          user_id: parseInt(userId),
          package_id: parseInt(boostId),
          amount: packageInfo.price_uni,
          daily_rate: packageInfo.rate_multiplier,
          start_date: new Date(),
          end_date: endDate,
          is_active: true
        })
        .returning();

      // Списываем средства с баланса
      const newBalance = (userBalance - requiredAmount).toString();
      await db
        .update(users)
        .set({ balance_uni: newBalance })
        .where(eq(users.id, parseInt(userId)));

      return {
        id: newBoost.id,
        package_id: newBoost.package_id,
        amount: newBoost.amount,
        daily_rate: parseFloat(newBoost.daily_rate),
        start_date: newBoost.start_date,
        end_date: newBoost.end_date,
        is_active: newBoost.is_active ?? true
      };
    } catch (error) {
      console.error('[BoostService] Ошибка активации буста:', error);
      throw error;
    }
  }

  /**
   * Деактивировать буст
   */
  static async deactivateBoost(userId: string, boostId: string): Promise<void> {
    try {
      console.log(`[BoostService] Деактивация буста ${boostId} для пользователя ${userId}`);

      const [boost] = await db
        .select()
        .from(userBoosts)
        .where(and(
          eq(userBoosts.id, parseInt(boostId)),
          eq(userBoosts.user_id, parseInt(userId)),
          eq(userBoosts.is_active, true)
        ))
        .limit(1);

      if (!boost) {
        throw new Error('Буст не найден или уже деактивирован');
      }

      await db
        .update(userBoosts)
        .set({ is_active: false })
        .where(eq(userBoosts.id, parseInt(boostId)));
    } catch (error) {
      console.error('[BoostService] Ошибка деактивации буста:', error);
      throw error;
    }
  }

  /**
   * Получить статистику использования бустов
   */
  static async getBoostStats(userId: string): Promise<{
    total_boosts_used: number;
    total_spent_uni: string;
    total_spent_ton: string;
    most_used_boost: string;
    total_bonus_earned: string;
  }> {
    try {
      console.log(`[BoostService] Получение статистики бустов для пользователя ${userId}`);

      // Получаем общее количество использованных бустов
      const [totalBoosts] = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(userBoosts)
        .where(eq(userBoosts.user_id, parseInt(userId)));

      // Получаем общую сумму потраченных UNI
      const [totalSpentUni] = await db
        .select({ total: sql<string>`COALESCE(SUM(${userBoosts.amount}), '0')` })
        .from(userBoosts)
        .where(eq(userBoosts.user_id, parseInt(userId)));

      // Получаем самый используемый буст
      const [mostUsedBoost] = await db
        .select({
          name: boostPackages.name,
          count: sql<number>`COUNT(*)`
        })
        .from(userBoosts)
        .leftJoin(boostPackages, eq(userBoosts.package_id, boostPackages.id))
        .where(eq(userBoosts.user_id, parseInt(userId)))
        .groupBy(boostPackages.name)
        .orderBy(sql`COUNT(*) DESC`)
        .limit(1);

      // Получаем общий бонус
      const [totalBonus] = await db
        .select({ total: sql<string>`COALESCE(SUM(${userBoosts.total_earned}), '0')` })
        .from(userBoosts)
        .where(eq(userBoosts.user_id, parseInt(userId)));

      return {
        total_boosts_used: Number(totalBoosts?.count || 0),
        total_spent_uni: totalSpentUni?.total || '0',
        total_spent_ton: '0', // TON не используется в текущей версии
        most_used_boost: mostUsedBoost?.name || 'Нет данных',
        total_bonus_earned: totalBonus?.total || '0'
      };
    } catch (error) {
      console.error('[BoostService] Ошибка получения статистики бустов:', error);
      throw error;
    }
  }
} 