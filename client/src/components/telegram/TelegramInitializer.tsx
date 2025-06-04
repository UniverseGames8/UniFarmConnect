import React, { useEffect } from 'react';

export const TelegramInitializer: React.FC = () => {
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      try {
        window.Telegram.WebApp.ready();
        window.Telegram.WebApp.expand();
      } catch (error) {
        console.error('Failed to initialize Telegram WebApp:', error);
      }
    }
  }, []);

  return null;
};

export default TelegramInitializer;