/**
 * Сервис для работы с Telegram WebApp API
 * Обработка initData, пользовательских данных и интеграции с Mini App
 */

class TelegramService {
  private webApp: TelegramWebApp | null = null;
  private initialized: boolean = false;

  constructor() {
    this.initialize();
  }

  /**
   * Инициализация Telegram WebApp
   */
  private initialize(): void {
    if (typeof window === 'undefined') {
      console.log('[telegramService] Окружение не браузер');
      return;
    }

    const initTelegram = () => {
      if (window.Telegram?.WebApp) {
        this.webApp = window.Telegram.WebApp;
        this.webApp.ready();
        this.initialized = true;
        console.log('[telegramService] Telegram WebApp успешно инициализирован');
        
        if (this.webApp) {
          this.webApp.expand();
        }
      } else {
        console.log('[telegramService] Telegram WebApp недоступен, работаем в fallback режиме');
      }
    };

    if (window.Telegram?.WebApp) {
      initTelegram();
    } else {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTelegram);
      } else {
        setTimeout(initTelegram, 100);
      }
    }
  }

  /**
   * Проверка доступности Telegram WebApp
   */
  isAvailable(): boolean {
    return this.initialized && this.webApp !== null;
  }

  /**
   * Получение данных пользователя
   */
  getUser(): { id: number; first_name?: string; last_name?: string; username?: string; language_code?: string } | null {
    if (!this.isAvailable() || !this.webApp) {
      console.log('[telegramService] WebApp недоступен для получения пользователя');
      return null;
    }
    return this.webApp.initDataUnsafe.user || null;
  }

  /**
   * Получение initData для отправки на сервер
   */
  getInitData(): string {
    if (!this.isAvailable() || !this.webApp) {
      console.log('[telegramService] WebApp недоступен для получения initData');
      return '';
    }
    
    return this.webApp.initData || '';
  }

  /**
   * Получение start параметра
   */
  getStartParam(): string | null {
    if (!this.isAvailable() || !this.webApp) {
      return null;
    }
    // В глобальном типе нет start_param, используем query_id
    // Убедимся, что возвращаем строку, а не null, если query_id отсутствует
    return this.webApp.initDataUnsafe.query_id || '';
  }

  /**
   * Подготовка заголовков для API запросов
   */
  getApiHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const initData = this.getInitData();
    const user = this.getUser();

    console.log('[telegramService] Подготовка заголовков:', {
      hasInitData: !!initData,
      initDataLength: initData.length,
      hasUser: !!user
    });

    if (initData) {
      headers['X-Telegram-Init-Data'] = initData;
    }

    if (user) {
      headers['X-Telegram-User-Id'] = user.id.toString();
    }

    return headers;
  }

  /**
   * Получение информации о среде
   */
  getEnvironmentInfo() {
    if (!this.isAvailable() || !this.webApp) {
      return {
        platform: 'unknown',
        version: '0.0',
        isInIframe: window.self !== window.top,
        userAgent: navigator.userAgent
      };
    }

    return {
      platform: this.webApp.platform,
      version: this.webApp.version,
      colorScheme: this.webApp.colorScheme,
      viewportHeight: this.webApp.viewportHeight,
      viewportStableHeight: this.webApp.viewportStableHeight,
      isExpanded: this.webApp.isExpanded,
      isInIframe: window.self !== window.top,
      userAgent: navigator.userAgent
    };
  }

  /**
   * Расширение WebApp
   */
  expand(): void {
    if (this.isAvailable() && this.webApp) {
      this.webApp.expand();
    }
  }

  /**
   * Закрытие WebApp
   */
  close(): void {
    if (this.isAvailable() && this.webApp) {
      this.webApp.close();
    }
  }

  /**
   * Отправка данных родительскому окну
   */
  sendData(data: any): void {
    if (this.isAvailable() && this.webApp) {
      this.webApp.sendData(JSON.stringify(data));
    }
  }

  /**
   * Работа с главной кнопкой
   */
  showMainButton(text: string, onClick: () => void): void {
    if (!this.isAvailable()) return;

    const mainButton = this.webApp!.MainButton;
    mainButton.setText(text);
    mainButton.onClick(onClick);
    mainButton.show();
  }

  hideMainButton(): void {
    if (this.isAvailable()) {
      this.webApp!.MainButton.hide();
    }
  }

  /**
   * Тактильная обратная связь
   */
  hapticFeedback(type: 'impact' | 'notification' | 'selection', style?: string): void {
    if (!this.isAvailable()) return;

    const haptic = this.webApp!.HapticFeedback;
    
    switch (type) {
      case 'impact':
        haptic.impactOccurred(style as any || 'medium');
        break;
      case 'notification':
        haptic.notificationOccurred(style as any || 'success');
        break;
      case 'selection':
        haptic.selectionChanged();
        break;
    }
  }

  /**
   * Fallback логика при отсутствии Telegram данных
   */
  getFallbackData(guestId: string, refCode?: string) {
    const envInfo = this.getEnvironmentInfo();
    
    console.log('[telegramService] Детали среды:', envInfo);
    console.log(`[telegramService] ⚠️ Нет данных Telegram, fallback к guest_id: ${guestId}, рефкод: ${refCode || 'отсутствует'}`);
    
    return {
      guestId,
      refCode: refCode || null,
      environment: envInfo,
      isFallback: true,
      reason: 'no_telegram_data'
    };
  }

  /**
   * Проверка на реальное окружение (не iframe preview)
   */
  isPreviewMode(): boolean {
    if (typeof window === 'undefined') return false;
    
    const envInfo = this.getEnvironmentInfo();
    const hostname = window.location.hostname;
    
    // Проверяем признаки preview режима
    const isReplit = hostname.includes('replit.app') || hostname.includes('replit.dev');
    const isInIframe = envInfo.isInIframe;
    const noValidTelegramData = !this.getInitData() || this.getInitData().length === 0;
    
    return isReplit && isInIframe && noValidTelegramData;
  }

  /**
   * Проверка на реальное Telegram окружение
   */
  isRealTelegramEnvironment(): boolean {
    // Проверяем наличие реальных Telegram данных
    const hasValidInitData = this.getInitData().length > 0;
    const hasValidUser = this.getUser() !== null;
    const envInfo = this.getEnvironmentInfo();
    
    // Telegram Mini App должен иметь специфичные характеристики
    const isTelegramUserAgent = envInfo.userAgent.includes('Telegram') || 
                               envInfo.platform !== 'unknown';
    
    return hasValidInitData && hasValidUser && isTelegramUserAgent;
  }
}

// Экспорт singleton instance
export const telegramService = new TelegramService();
export default telegramService;

/**
 * Функция для получения заголовков авторизации Telegram
 * Совместимость с queryClient.ts
 */
export function getTelegramAuthHeaders(): Record<string, string> {
  return telegramService.getApiHeaders();
}

/**
 * Функция для получения отображаемого имени пользователя Telegram
 */
export function getTelegramUserDisplayName(): string {
  const user = telegramService.getUser();
  if (!user) return 'Пользователь';
  
  // Приоритет: first_name + last_name, затем username, затем значение по умолчанию
  const firstName = user.first_name || '';
  const lastName = user.last_name || '';
  const username = user.username || '';
  
  if (firstName) {
    return lastName ? `${firstName} ${lastName}` : firstName;
  }
  
  if (username) {
    return username;
  }
  
  return 'Пользователь';
}

/**
 * Проверка, является ли среда Telegram WebApp
 */
export function isTelegramWebApp(): boolean {
  return telegramService.isAvailable();
}

/**
 * Заглушка для совместимости - инициализация Telegram WebApp
 */
export function initTelegramWebApp(): Promise<boolean> {
  console.log('[telegramService] initTelegramWebApp: используется автоматическая инициализация');
  return Promise.resolve(telegramService.isAvailable());
}

/**
 * Заглушка для совместимости - получение данных пользователя Telegram
 */
export function getTelegramUserData(): any {
  const user = telegramService.getUser();
  return user ? {
    id: user.id,
    username: user.username,
    first_name: user.first_name,
    last_name: user.last_name
  } : null;
}

/**
 * Заглушка для совместимости - логирование запуска приложения
 */
export function logAppLaunch(): void {
  console.log('[telegramService] logAppLaunch: приложение запущено');
}

/**
 * Заглушка для совместимости - регистрация пользователя Telegram
 */
export async function registerTelegramUser(telegramId: number, userData: any, refCode?: string): Promise<any> {
  console.log('[telegramService] registerTelegramUser: используйте userService.createUser вместо этой функции');
  
  // Используем импортированный userService
  const { default: userService } = await import('./userService');
  
  return userService.createUser({
    telegramId,
    username: userData.username,
    firstName: userData.first_name,
    lastName: userData.last_name,
    refCode
  });
}
