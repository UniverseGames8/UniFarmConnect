import { ReactNode, useEffect, useState } from 'react';
import { telegramService } from '../services/telegramService';

interface TelegramCheckProps {
  children: ReactNode;
}

export const TelegramCheck = ({ children }: TelegramCheckProps) => {
  const [isTelegram, setIsTelegram] = useState<boolean | null>(null);

  useEffect(() => {
    const checkTelegram = async () => {
      const isInitialized = await telegramService.initialize();
      setIsTelegram(isInitialized && telegramService.isRealTelegramEnvironment());
    };

    checkTelegram();
  }, []);

  if (isTelegram === null) {
    return <div>Loading...</div>; // TODO: Заменить на компонент загрузки
  }

  if (!isTelegram) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Доступ запрещен</h1>
        <p className="text-gray-600">
          Это приложение доступно только в Telegram Mini App.
          Пожалуйста, откройте его через Telegram.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}; 