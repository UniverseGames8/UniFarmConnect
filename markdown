# UniFarm

## Переменные окружения

### Сервер (.env)

#### Основные настройки
- `NODE_ENV` - окружение (production/development)
- `PORT` - порт сервера (по умолчанию 3000)
- `API_PREFIX` - префикс API (по умолчанию /api/v2)
- `LOG_LEVEL` - уровень логирования

#### База данных
- `DATABASE_URL` - URL подключения к PostgreSQL

#### JWT
- `JWT_SECRET` - секретный ключ для JWT
- `JWT_EXPIRES_IN` - время жизни JWT токена

#### Telegram
- `TELEGRAM_BOT_TOKEN` - токен Telegram бота
- `TELEGRAM_BOT_USERNAME` - username бота
- `TELEGRAM_WEBAPP_URL` - URL веб-приложения
- `TELEGRAM_WEBHOOK_URL` - URL для вебхуков
- `TELEGRAM_WEBHOOK_SECRET` - секрет для вебхуков
- `TELEGRAM_VALIDATE_INIT_DATA` - валидация данных инициализации

#### TON
- `TON_API_KEY` - API ключ TON
- `TON_API_URL` - URL API TON
- `TON_WALLET_ADDRESS` - адрес кошелька
- `TX_LIFETIME` - время жизни транзакции

#### CORS
- `CORS_ORIGIN` - разрешенные домены

#### Rate Limiting
- `RATE_LIMIT_WINDOW_MS` - окно для rate limiting
- `RATE_LIMIT_MAX_REQUESTS` - максимальное количество запросов

### Клиент (.env)

#### API
- `VITE_API_URL` - URL бэкенда
- `VITE_WS_URL` - URL WebSocket

#### Telegram
- `VITE_TELEGRAM_BOT_USERNAME` - username бота
- `VITE_TELEGRAM_WEBAPP_URL` - URL веб-приложения
- `VITE_TELEGRAM_WEBAPP_NAME` - название веб-приложения

#### Project
- `VITE_PROJECT_NAME` - название проекта