import express from 'express';
import cors from 'cors';
import { config } from './config';
import { db } from './db';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { errorHandler } from './middleware/errorHandler';
import { telegramAuthMiddleware } from './middleware/telegramAuth';
const apiPrefix = config.apiPrefix;

// Импорт маршрутов
import userRoutes from './routes/userRoutes';
import walletRoutes from './routes/walletRoutes';
import farmingRoutes from './routes/farmingRoutes';
import referralRoutes from './routes/referralRoutes';
import dailyBonusRoutes from './routes/dailyBonusRoutes';
import missionsRoutes from './routes/missionsRoutes';
import boostRoutes from './routes/boostRoutes';
import adminRoutes from './routes/adminRoutes';
import telegramRoutes from './routes/telegramRoutes';
import authRoutes from './routes/authRoutes';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(telegramAuthMiddleware);

// API v2 маршруты
app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/users`, userRoutes);
app.use(`${apiPrefix}/wallets`, walletRoutes);
app.use(`${apiPrefix}/farming`, farmingRoutes);
app.use(`${apiPrefix}/referrals`, referralRoutes);
app.use(`${apiPrefix}/daily-bonus`, dailyBonusRoutes);
app.use(`${apiPrefix}/missions`, missionsRoutes);
app.use(`${apiPrefix}/boosts`, boostRoutes);
app.use(`${apiPrefix}/admin`, adminRoutes);
app.use(`${apiPrefix}/telegram`, telegramRoutes);

// Обработка ошибок
app.use(errorHandler);

// Запуск сервера
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Применяем миграции
    await migrate(db, { migrationsFolder: 'drizzle' });
    console.log('✅ Миграции успешно применены');

    // Запускаем сервер
    app.listen(PORT, () => {
      console.log(`🚀 Сервер запущен на порту ${PORT}`);
      console.log(`📝 API доступно по адресу: http://localhost:${PORT}${apiPrefix}`);
    });
  } catch (error) {
    console.error('❌ Ошибка при запуске сервера:', error);
    process.exit(1);
  }
}

startServer(); 