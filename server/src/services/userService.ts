import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

export class UserService {
  /**
   * Получение пользователя по ID
   */
  static async getUserById(userId: number) {
    try {
      console.log('[UserService] Получение пользователя по ID:', { user_id: userId });

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user) {
        console.log('[UserService] Пользователь не найден:', { user_id: userId });
        return null;
      }

      console.log('[UserService] Пользователь найден:', {
        user_id: user.id,
        telegram_id: user.telegram_id
      });

      return user;
    } catch (error) {
      console.error('[UserService] Ошибка получения пользователя:', error);
      throw error;
    }
  }

  /**
   * Создание нового пользователя
   */
  static async createUser(userData: {
    guest_id: string;
    parent_ref_code?: string | null;
  }) {
    try {
      console.log('[UserService] Создание нового пользователя:', userData);

      // Проверяем существование пользователя
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.guest_id, userData.guest_id))
        .limit(1);

      if (existingUser) {
        console.log('[UserService] Пользователь уже существует:', {
          guest_id: userData.guest_id
        });
        return existingUser;
      }

      // Генерируем реферальный код
      const refCode = `REF${Date.now()}`.substring(0, 8).toUpperCase();

      // Создаем пользователя
      const [newUser] = await db
        .insert(users)
        .values({
          guest_id: userData.guest_id,
          parent_ref_code: userData.parent_ref_code,
          ref_code: refCode,
          balance_uni: '0',
          balance_ton: '0'
        })
        .returning();

      console.log('[UserService] Пользователь создан:', {
        user_id: newUser.id,
        guest_id: newUser.guest_id,
        ref_code: newUser.ref_code
      });

      return newUser;
    } catch (error) {
      console.error('[UserService] Ошибка создания пользователя:', error);
      throw error;
    }
  }

  /**
   * Обновление данных пользователя
   */
  static async updateUser(userId: number, updates: {
    username?: string;
    balance_uni?: string;
    balance_ton?: string;
  }) {
    try {
      console.log('[UserService] Обновление данных пользователя:', {
        user_id: userId,
        updates
      });

      const [updatedUser] = await db
        .update(users)
        .set(updates)
        .where(eq(users.id, userId))
        .returning();

      if (!updatedUser) {
        console.log('[UserService] Пользователь не найден:', { user_id: userId });
        return null;
      }

      console.log('[UserService] Данные пользователя обновлены:', {
        user_id: updatedUser.id,
        updates
      });

      return updatedUser;
    } catch (error) {
      console.error('[UserService] Ошибка обновления пользователя:', error);
      throw error;
    }
  }

  /**
   * Генерация реферального кода
   */
  static async generateRefCode(userId: number) {
    try {
      console.log('[UserService] Генерация реферального кода:', { user_id: userId });

      // Генерируем уникальный код
      const refCode = `REF${Date.now()}`.substring(0, 8).toUpperCase();

      // Обновляем пользователя
      const [updatedUser] = await db
        .update(users)
        .set({ ref_code: refCode })
        .where(eq(users.id, userId))
        .returning();

      if (!updatedUser) {
        console.log('[UserService] Пользователь не найден:', { user_id: userId });
        throw new Error('Пользователь не найден');
      }

      console.log('[UserService] Реферальный код сгенерирован:', {
        user_id: updatedUser.id,
        ref_code: updatedUser.ref_code
      });

      return updatedUser.ref_code;
    } catch (error) {
      console.error('[UserService] Ошибка генерации реферального кода:', error);
      throw error;
    }
  }

  /**
   * Получение пользователя по Telegram ID
   */
  static async getUserByTelegramId(telegramId: string) {
    try {
      console.log('[UserService] Получение пользователя по Telegram ID:', { telegram_id: telegramId });

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.telegram_id, telegramId))
        .limit(1);

      if (!user) {
        console.log('[UserService] Пользователь не найден:', { telegram_id: telegramId });
        return null;
      }

      console.log('[UserService] Пользователь найден:', {
        user_id: user.id,
        telegram_id: user.telegram_id
      });

      return user;
    } catch (error) {
      console.error('[UserService] Ошибка получения пользователя:', error);
      throw error;
    }
  }
}; 