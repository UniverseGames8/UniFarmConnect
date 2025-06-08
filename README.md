# UniFarm

UniFarm - это платформа для управления фермерскими хозяйствами с интеграцией Telegram бота.

## Структура проекта

- `client/` - Frontend приложение (React)
- `server/` - Backend приложение (Node.js + Express)

## Развертывание на Railway

1. Создайте аккаунт на [Railway](https://railway.app/)
2. Установите Railway CLI:
   ```bash
   npm i -g @railway/cli
   ```
3. Войдите в аккаунт Railway:
   ```bash
   railway login
   ```
4. Инициализируйте проект:
   ```bash
   railway init
   ```
5. Настройте переменные окружения в Railway Dashboard:
   - `PORT` - порт для сервера (по умолчанию 3000)
   - `MONGODB_URI` - URI для подключения к MongoDB
   - `TELEGRAM_BOT_TOKEN` - токен Telegram бота
   - `TELEGRAM_WEBHOOK_URL` - URL для вебхука Telegram (будет установлен автоматически)
   - `JWT_SECRET` - секретный ключ для JWT
   - `NODE_ENV` - окружение (production)

6. Задеплойте проект:
   ```bash
   railway up
   ```

## Локальная разработка

1. Клонируйте репозиторий:
   ```bash
   git clone <repository-url>
   cd unifarm
   ```

2. Установите зависимости:
```bash
   # Установка зависимостей для frontend
cd client
npm install

   # Установка зависимостей для backend
   cd ../server
   npm install
```

3. Создайте файл `.env` в корневой директории на основе `.env.example`

4. Запустите приложение:
```bash
   # Запуск frontend
   cd client
   npm run dev

   # Запуск backend
   cd ../server
npm run dev
```

## API Endpoints

### Аутентификация
- `POST /api/auth/register` - Регистрация нового пользователя
- `POST /api/auth/login` - Вход в систему
- `GET /api/auth/me` - Получение информации о текущем пользователе

### Фермы
- `GET /api/farms` - Получение списка ферм
- `POST /api/farms` - Создание новой фермы
- `GET /api/farms/:id` - Получение информации о ферме
- `PUT /api/farms/:id` - Обновление информации о ферме
- `DELETE /api/farms/:id` - Удаление фермы

### Животные
- `GET /api/animals` - Получение списка животных
- `POST /api/animals` - Добавление нового животного
- `GET /api/animals/:id` - Получение информации о животном
- `PUT /api/animals/:id` - Обновление информации о животном
- `DELETE /api/animals/:id` - Удаление животного

### Telegram Webhook
- `POST /api/telegram/webhook` - Endpoint для вебхука Telegram бота

## Технологии

- Frontend:
  - React
  - TypeScript
  - Tailwind CSS
  - React Query
  - React Router

- Backend:
  - Node.js
  - Express
  - TypeScript
  - MongoDB
  - JWT
  - Telegram Bot API

## Лицензия

MIT 