import { InferModel } from 'drizzle-orm';
import { users } from '../db/schema';

export type User = InferModel<typeof users>;
export type NewUser = InferModel<typeof users, 'insert'>;

export interface UserResponse {
  id: string;
  username: string;
  email: string;
  telegramId?: string;
  walletAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserCreateInput {
  username: string;
  email: string;
  password: string;
  telegramId?: string;
  walletAddress?: string;
}

export interface UserUpdateInput {
  username?: string;
  email?: string;
  password?: string;
  telegramId?: string;
  walletAddress?: string;
} 