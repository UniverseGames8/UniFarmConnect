import { useEffect, useState } from 'react';

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

export const useTelegram = () => {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      setWebApp(tg);
      tg.ready();
      setIsReady(true);
    }
  }, []);

  return {
    webApp,
    isReady,
    user: webApp?.initDataUnsafe?.user,
    initData: webApp?.initData,
  };
}; 