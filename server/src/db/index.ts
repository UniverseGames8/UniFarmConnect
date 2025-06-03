import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

// Получаем URL базы данных из переменных окружения
const sql = neon(process.env.DATABASE_URL!);

// Создаем экземпляр Drizzle ORM
export const db = drizzle(sql, { schema });

// Экспортируем схему для использования в других файлах
export { schema }; 