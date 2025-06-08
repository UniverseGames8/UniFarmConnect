export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export interface UserAttributes {
  id: number;
  email: string;
  password: string;
  role: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
} 