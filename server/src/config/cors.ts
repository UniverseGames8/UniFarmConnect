import cors from 'cors';
import { config } from '../config';

const allowedOrigins = config.environment === 'production'
  ? [
      'https://unifarm.app',
      'https://www.unifarm.app',
      'https://api.unifarm.app',
      'https://app.unifarm.app',
      'https://web.unifarm.app',
      // Railway домен (если используется)
      'https://unifarm-production.up.railway.app'
    ]
  : ['http://localhost:5173', 'http://localhost:3000'];

export const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Разрешаем запросы без origin (например, от мобильных приложений)
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-Guest-ID',
    'X-API-Key'
  ],
  exposedHeaders: ['X-Rate-Limit-Remaining', 'X-Rate-Limit-Reset'],
  credentials: true,
  maxAge: 86400, // 24 часа
  preflightContinue: false,
  optionsSuccessStatus: 204
}; 