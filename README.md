# UniFarm Connect

Telegram Mini App для фарминга и управления криптовалютными активами.

## Структура проекта

```
uni-farm/
├── client/             # React + TypeScript frontend
├── server/             # Node.js/Express backend
├── .gitignore
├── README.md
├── vercel.json         # Конфигурация Vercel
├── railway.json        # Конфигурация Railway
├── gpt_rules.md        # Правила работы AI
└── redmap.md           # Документация бизнес-логики
```

## Запуск проекта

### Фронтенд (client/)

```bash
cd client
npm install
npm run dev
```

Фронтенд будет доступен по адресу: http://localhost:5173

### Бэкенд (server/)

```bash
cd server
npm install
npm run dev
```

Бэкенд будет доступен по адресу: http://localhost:3000

## Деплой

### Фронтенд (Vercel)
- Автоматический деплой при пуше в main
- Конфигурация в vercel.json

### Бэкенд (Railway)
- Автоматический деплой при пуше в main
- Конфигурация в railway.json

## API Endpoints

Все API endpoints доступны по базовому пути `/api/v2/`:

- `/api/v2/me` - данные пользователя
- `/api/v2/wallet/balance` - баланс кошелька
- `/api/v2/farming/status` - статус фарминга
- `/api/v2/missions` - список заданий
- `/api/v2/referral` - реферальная система

## Разработка

1. Создайте ветку для новой функциональности
2. Внесите изменения
3. Создайте Pull Request
4. После проверки изменения будут объединены в main

## Документация

- `gpt_rules.md` - правила работы с AI
- `redmap.md` - документация бизнес-логики 