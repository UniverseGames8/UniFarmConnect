import { db } from '../db';
import { users, sessions } from '../db/schema';
import { eq, and, gt } from 'drizzle-orm';
import { config } from '../config';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export class AuthService {
  /**
   * Аутентификация пользователя через Telegram initData
   */
  static async authenticateWithTelegram(initData: string): Promise<{
    success: boolean;
    user?: any;
    token?: string;
    sessionId?: string;
    error?: string;
  }> {
    try {
      console.log('[AuthService] Аутентификация через Telegram initData');
      
      // Валидация initData
      const isValid = await this.validateTelegramInitData(initData);
      if (!isValid) {
        return {
          success: false,
          error: 'Недействительные данные Telegram'
        };
      }

      // Парсинг данных пользователя
      const params = new URLSearchParams(initData);
      const userData = JSON.parse(params.get('user') || '{}');
      
      if (!userData.id) {
        return {
          success: false,
          error: 'Отсутствуют данные пользователя'
        };
      }

      // Поиск или создание пользователя
      let [user] = await db
        .select()
        .from(users)
        .where(eq(users.telegram_id, userData.id.toString()))
        .limit(1);

      if (!user) {
        // Создаем нового пользователя
        [user] = await db
          .insert(users)
          .values({
            telegram_id: userData.id.toString(),
            username: userData.username || null,
            first_name: userData.first_name || null,
            last_name: userData.last_name || null,
            language_code: userData.language_code || null,
            is_bot: false,
            is_premium: userData.is_premium || false
          })
          .returning();
      }

      // Генерация токена
      const token = await this.generateJWT({
        user_id: user.id,
        telegram_id: user.telegram_id
      });

      // Создание сессии
      const [session] = await db
        .insert(sessions)
        .values({
          user_id: user.id,
          token,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 часа
          is_active: true
        })
        .returning();

      return {
        success: true,
        user,
        token,
        sessionId: session.id.toString()
      };
    } catch (error) {
      console.error('[AuthService] Ошибка аутентификации через Telegram:', error);
      return {
        success: false,
        error: 'Ошибка аутентификации'
      };
    }
  }

  /**
   * Валидация JWT токена
   */
  static async validateToken(token: string): Promise<boolean> {
    try {
      console.log('[AuthService] Валидация JWT токена');
      
      // Проверка подписи токена
      const decoded = jwt.verify(token, config.jwtSecret) as { user_id: number };
      
      // Проверка существования сессии
      const [session] = await db
        .select()
        .from(sessions)
        .where(and(
          eq(sessions.token, token),
          eq(sessions.is_active, true),
          gt(sessions.expires_at, new Date())
        ))
        .limit(1);

      return !!session;
    } catch (error) {
      console.error('[AuthService] Ошибка валидации токена:', error);
      return false;
    }
  }

  /**
   * Обновление токена доступа
   */
  static async refreshToken(refreshToken: string): Promise<{
    success: boolean;
    accessToken?: string;
    refreshToken?: string;
    expiresIn?: number;
    error?: string;
  }> {
    try {
      console.log('[AuthService] Обновление токена доступа');
      
      // Проверка refresh токена
      const decoded = jwt.verify(refreshToken, config.jwtSecret) as { user_id: number };
      
      // Проверка существования пользователя
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, decoded.user_id))
        .limit(1);

      if (!user) {
        return {
          success: false,
          error: 'Пользователь не найден'
        };
      }

      // Генерация нового токена
      const accessToken = await this.generateJWT({
        user_id: user.id,
        telegram_id: user.telegram_id
      });

      // Создание новой сессии
      const [session] = await db
        .insert(sessions)
        .values({
          user_id: user.id,
          token: accessToken,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 часа
          is_active: true
        })
        .returning();

      return {
        success: true,
        accessToken,
        refreshToken: refreshToken,
        expiresIn: 24 * 60 * 60 // 24 часа в секундах
      };
    } catch (error) {
      console.error('[AuthService] Ошибка обновления токена:', error);
      return {
        success: false,
        error: 'Недействительный refresh token'
      };
    }
  }

  /**
   * Аннулирование токена
   */
  static async invalidateToken(token: string): Promise<boolean> {
    try {
      console.log('[AuthService] Аннулирование токена');
      
      // Деактивация сессии
      await db
        .update(sessions)
        .set({ is_active: false })
        .where(eq(sessions.token, token));

      return true;
    } catch (error) {
      console.error('[AuthService] Ошибка аннулирования токена:', error);
      return false;
    }
  }

  /**
   * Получение информации о сессии
   */
  static async getSessionInfo(token: string): Promise<any> {
    try {
      console.log('[AuthService] Получение информации о сессии');
      
      // Проверка токена
      const decoded = jwt.verify(token, config.jwtSecret) as { user_id: number };
      
      // Получение информации о сессии
      const [session] = await db
        .select()
        .from(sessions)
        .where(and(
          eq(sessions.token, token),
          eq(sessions.is_active, true)
        ))
        .limit(1);

      if (!session) {
        throw new Error('Сессия не найдена');
      }

      return {
        user_id: session.user_id,
        session_id: session.id,
        created_at: session.created_at,
        expires_at: session.expires_at,
        is_active: session.is_active
      };
    } catch (error) {
      console.error('[AuthService] Ошибка получения информации о сессии:', error);
      throw error;
    }
  }

  /**
   * Генерация JWT токена
   */
  static async generateJWT(payload: any): Promise<string> {
    try {
      console.log('[AuthService] Генерация JWT токена');
      
      return jwt.sign(payload, config.jwtSecret, {
        expiresIn: config.jwtExpiresIn
      });
    } catch (error) {
      console.error('[AuthService] Ошибка генерации JWT:', error);
      throw error;
    }
  }

  /**
   * Валидация данных Telegram initData
   */
  static async validateTelegramInitData(initData: string): Promise<boolean> {
    try {
      console.log('[AuthService] Валидация Telegram initData');
      
      if (!initData) {
        return false;
      }

      // Парсим данные
      const params = new URLSearchParams(initData);
      const hash = params.get('hash');
      params.delete('hash');

      // Сортируем параметры
      const sortedParams = Array.from(params.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');

      // Создаем HMAC
      const secretKey = crypto.createHmac('sha256', 'WebAppData')
        .update(config.telegramBotToken || '')
        .digest();

      const calculatedHash = crypto.createHmac('sha256', secretKey)
        .update(sortedParams)
        .digest('hex');

      return calculatedHash === hash;
    } catch (error) {
      console.error('[AuthService] Ошибка валидации initData:', error);
      return false;
    }
  }
} 