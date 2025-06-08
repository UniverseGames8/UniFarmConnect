import express from 'express';
import cors from 'cors';
import { initDatabase } from './config/init';
import { userRoutes } from './routes/userRoutes';
import { productRoutes } from './routes/productRoutes';

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);

// Initialize database and start server
const PORT = process.env.PORT || 3000;

initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });

export default app; 