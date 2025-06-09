import { Router } from 'express';
import { sql } from '@neondatabase/serverless';

const router = Router();

router.get('/health', async (req, res) => {
  try {
    // Проверяем подключение к базе данных
    await sql`SELECT 1`;
    
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({
      status: 'error',
      message: 'Service is unhealthy',
      timestamp: new Date().toISOString()
    });
  }
});

export default router; 