/**
 * Компонент для информирования пользователя о предпочтительном запуске в Telegram
 * Ранее блокировал приложение вне Telegram, теперь просто отключен согласно новому ТЗ
 */
import React from 'react';

const NotInTelegramWarning: React.FC = () => {
  // Согласно новому ТЗ мы полностью отключаем блокировку UI
  // Компонент всегда возвращает null
  return null;
};

export default NotInTelegramWarning;