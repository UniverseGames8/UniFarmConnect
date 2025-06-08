import { sequelize } from './database';
import { User } from '../models/User';
import { Product } from '../models/Product';

export const initDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // Sync all models
    await sequelize.sync({ alter: true });
    console.log('All models were synchronized successfully.');

    // Create admin user if not exists
    const adminExists = await User.findOne({ where: { role: 'ADMIN' } });
    if (!adminExists) {
      await User.create({
        email: 'admin@unifarm.com',
        password: 'admin123', // В продакшене нужно использовать хешированный пароль
        role: 'ADMIN'
      });
      console.log('Admin user created successfully.');
    }
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
}; 