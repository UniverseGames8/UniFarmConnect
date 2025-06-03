import { db } from '../db';
import { users, transactions } from '../db/schema';
import { eq } from 'drizzle-orm';

export class FarmingService {
  /**
   * Получение данных фарминга пользователя
   */
  static async getFarmingData(userId: number): Promise<{
    rate: string;
    accumulated: string;
    last_claim: string | null;
    can_claim: boolean;
    next_claim_available: string | null;
  }> {
    try {
      console.log('[FarmingService] Получение данных фарминга:', { user_id: userId });

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user) {
        console.log('[FarmingService] Пользователь не найден:', { user_id: userId });
        return {
          rate: '0.000000',
          accumulated: '0.000000',
          last_claim: null,
          can_claim: false,
          next_claim_available: null
        };
      }

      const now = new Date();
      const lastClaim = user.uni_farming_last_update ? new Date(user.uni_farming_last_update) : null;
      const farmingStart = user.uni_farming_start_timestamp ? new Date(user.uni_farming_start_timestamp) : now;
      
      // Расчет накопленного фарминга (базовая ставка 0.001 UNI в час)
      const baseRate = 0.001;
      const hoursElapsed = lastClaim 
        ? (now.getTime() - lastClaim.getTime()) / (1000 * 60 * 60)
        : (now.getTime() - farmingStart.getTime()) / (1000 * 60 * 60);
      
      const accumulated = Math.max(0, hoursElapsed * baseRate);
      
      const result = {
        rate: baseRate.toFixed(6),
        accumulated: accumulated.toFixed(6),
        last_claim: lastClaim?.toISOString() || null,
        can_claim: accumulated >= 0.001, // Минимум для клейма
        next_claim_available: lastClaim 
          ? new Date(lastClaim.getTime() + (24 * 60 * 60 * 1000)).toISOString() // 24 часа
          : null
      };

      console.log('[FarmingService] Данные фарминга получены:', {
        user_id: userId,
        result
      });

      return result;
    } catch (error) {
      console.error('[FarmingService] Ошибка получения данных фарминга:', error);
      throw error;
    }
  }

  /**
   * Запуск фарминга
   */
  static async startFarming(userId: number, amount: string): Promise<boolean> {
    try {
      console.log('[FarmingService] Запуск фарминга:', { user_id: userId, amount });

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user) {
        console.log('[FarmingService] Пользователь не найден:', { user_id: userId });
        return false;
      }

      // Проверяем баланс
      const balance = parseFloat(user.balance_uni || '0');
      const depositAmount = parseFloat(amount);

      if (balance < depositAmount) {
        console.log('[FarmingService] Недостаточно средств:', {
          user_id: userId,
          balance,
          required: depositAmount
        });
        return false;
      }

      // Обновляем баланс и запускаем фарминг
      await db.transaction(async (tx) => {
        // Списываем средства
        await tx
          .update(users)
          .set({
            balance_uni: (balance - depositAmount).toString(),
            uni_deposit_amount: amount,
            uni_farming_start_timestamp: new Date(),
            uni_farming_last_update: new Date()
          })
          .where(eq(users.id, userId));

        // Записываем транзакцию
        await tx
          .insert(transactions)
          .values({
            user_id: userId,
            type: 'farming_deposit',
            currency: 'UNI',
            amount: amount,
            status: 'confirmed'
          });
      });

      console.log('[FarmingService] Фарминг запущен:', {
        user_id: userId,
        amount
      });

      return true;
    } catch (error) {
      console.error('[FarmingService] Ошибка запуска фарминга:', error);
      throw error;
    }
  }

  /**
   * Сбор наград фарминга
   */
  static async claimRewards(userId: number): Promise<{ amount: string; claimed: boolean }> {
    try {
      console.log('[FarmingService] Сбор наград фарминга:', { user_id: userId });

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user || !user.uni_farming_start_timestamp) {
        console.log('[FarmingService] Фарминг не активен:', { user_id: userId });
        return { amount: "0", claimed: false };
      }

      // Расчет времени фарминга в часах
      const now = new Date();
      const farmingStart = new Date(user.uni_farming_start_timestamp);
      const farmingHours = (now.getTime() - farmingStart.getTime()) / (1000 * 60 * 60);

      if (farmingHours < 1) {
        console.log('[FarmingService] Недостаточно времени фарминга:', {
          user_id: userId,
          hours: farmingHours
        });
        return { amount: "0", claimed: false };
      }

      // Расчет базового вознаграждения (0.5% в сутки)
      const depositAmount = user.uni_deposit_amount || "0";
      const baseReward = (parseFloat(depositAmount) * 0.005 * (farmingHours / 24)).toString();

      if (parseFloat(baseReward) <= 0) {
        console.log('[FarmingService] Нет наград для сбора:', {
          user_id: userId,
          reward: baseReward
        });
        return { amount: "0", claimed: false };
      }

      // Обновляем баланс пользователя
      await db.transaction(async (tx) => {
        // Начисляем награду
        await tx
          .update(users)
          .set({
            balance_uni: (parseFloat(user.balance_uni || "0") + parseFloat(baseReward)).toString(),
            uni_farming_start_timestamp: now,
            uni_farming_last_update: now
          })
          .where(eq(users.id, userId));

        // Записываем транзакцию
        await tx
          .insert(transactions)
          .values({
            user_id: userId,
            type: 'farming_reward',
            currency: 'UNI',
            amount: baseReward,
            status: 'confirmed'
          });
      });

      console.log('[FarmingService] Награды собраны:', {
        user_id: userId,
        amount: baseReward
      });

      return { amount: baseReward, claimed: true };
    } catch (error) {
      console.error('[FarmingService] Ошибка сбора наград:', error);
      throw error;
    }
  }

  /**
   * Остановка фарминга
   */
  static async stopFarming(userId: number): Promise<boolean> {
    try {
      console.log('[FarmingService] Остановка фарминга:', { user_id: userId });

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user) {
        console.log('[FarmingService] Пользователь не найден:', { user_id: userId });
        return false;
      }

      // Возвращаем депозит и останавливаем фарминг
      await db.transaction(async (tx) => {
        const depositAmount = user.uni_deposit_amount || "0";
        
        // Возвращаем средства
        await tx
          .update(users)
          .set({
            balance_uni: (parseFloat(user.balance_uni || "0") + parseFloat(depositAmount)).toString(),
            uni_deposit_amount: "0",
            uni_farming_start_timestamp: null,
            uni_farming_last_update: new Date()
          })
          .where(eq(users.id, userId));

        // Записываем транзакцию
        await tx
          .insert(transactions)
          .values({
            user_id: userId,
            type: 'farming_withdraw',
            currency: 'UNI',
            amount: depositAmount,
            status: 'confirmed'
          });
      });

      console.log('[FarmingService] Фарминг остановлен:', { user_id: userId });

      return true;
    } catch (error) {
      console.error('[FarmingService] Ошибка остановки фарминга:', error);
      throw error;
    }
  }
}; 