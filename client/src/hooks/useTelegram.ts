import { useState, useEffect } from 'react';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export function useTelegram() {
  const [isReady, setIsReady] = useState(false);
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [initData, setInitData] = useState<string | null>(null);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    
    if (tg) {
      tg.ready();
      setIsReady(true);
      if (tg.initDataUnsafe.user) {
        setUser({
          id: tg.initDataUnsafe.user.id,
          first_name: tg.initDataUnsafe.user.first_name,
          last_name: tg.initDataUnsafe.user.last_name,
          username: tg.initDataUnsafe.user.username,
          language_code: tg.initDataUnsafe.user.language_code
        });
      }
      setInitData(tg.initData || null);
      
      // Expand the app to full height
      tg.expand();
    }
  }, []);

  const showMainButton = (text: string, onClick: () => void) => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.MainButton.text = text;
      tg.MainButton.show();
      tg.MainButton.onClick(onClick);
    }
  };

  const hideMainButton = () => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.MainButton.hide();
    }
  };

  const showBackButton = (onClick: () => void) => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.BackButton.show();
      tg.BackButton.onClick(onClick);
    }
  };

  const hideBackButton = () => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.BackButton.hide();
    }
  };

  const close = () => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.close();
    }
  };

  return {
    isReady,
    user,
    initData,
    showMainButton,
    hideMainButton,
    showBackButton,
    hideBackButton,
    close,
    tg: window.Telegram?.WebApp
  };
}