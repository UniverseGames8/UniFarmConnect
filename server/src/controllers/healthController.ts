import { Request, Response } from 'express';
import { db } from '../db';
import { sql } from 'drizzle-orm';

export const healthCheck = async (req: Request, res: Response) => {
  try {
    // Проверяем подключение к базе данных
    await db.execute(sql`SELECT 1`);
    
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      database: 'connected',
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Service unavailable',
      database: 'disconnected',
    });
  }
}; 