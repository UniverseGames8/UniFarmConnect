import { pgTable, serial, text, timestamp, decimal, integer, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  guest_id: text('guest_id').notNull().unique(),
  telegram_id: text('telegram_id'),
  username: text('username'),
  balance_uni: text('balance_uni').notNull().default('0'),
  balance_ton: text('balance_ton').notNull().default('0'),
  ref_code: text('ref_code').unique(),
  parent_ref_code: text('parent_ref_code'),
  uni_farming_balance: text('uni_farming_balance').default('0'),
  uni_farming_rate: text('uni_farming_rate').default('0'),
  uni_deposit_amount: text('uni_deposit_amount').default('0'),
  uni_farming_start_timestamp: timestamp('uni_farming_start_timestamp'),
  uni_farming_last_update: timestamp('uni_farming_last_update'),
  checkin_streak: integer('checkin_streak').default(0),
  max_checkin_streak: integer('max_checkin_streak').default(0),
  checkin_last_date: timestamp('checkin_last_date'),
  last_active: timestamp('last_active').defaultNow(),
  created_at: timestamp('created_at').defaultNow()
});

export const missions = pgTable('missions', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  reward_amount: decimal('reward_amount').notNull(),
  type: text('type').notNull(),
  status: text('status').notNull().default('active'),
  created_at: timestamp('created_at').defaultNow()
});

export const userMissions = pgTable('user_missions', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => users.id),
  mission_id: integer('mission_id').references(() => missions.id),
  completed_at: timestamp('completed_at').defaultNow(),
  created_at: timestamp('created_at').defaultNow()
});

export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => users.id),
  type: text('type').notNull(),
  amount: text('amount').notNull(),
  currency: text('currency').notNull(),
  status: text('status').notNull(),
  description: text('description'),
  created_at: timestamp('created_at').defaultNow()
});

export const boostPackages = pgTable('boost_packages', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  price_uni: text('price_uni').notNull(),
  rate_multiplier: text('rate_multiplier').notNull(),
  duration_days: integer('duration_days').notNull(),
  is_active: boolean('is_active').default(true),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
});

export const userBoosts = pgTable('user_boosts', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => users.id).notNull(),
  package_id: integer('package_id').references(() => boostPackages.id).notNull(),
  amount: text('amount').notNull(),
  daily_rate: text('daily_rate').notNull(),
  start_date: timestamp('start_date').notNull(),
  end_date: timestamp('end_date').notNull(),
  last_claim: timestamp('last_claim'),
  total_earned: text('total_earned').default('0'),
  is_active: boolean('is_active').default(true),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
});

export const referrals = pgTable('referrals', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => users.id),
  inviter_id: integer('inviter_id').references(() => users.id),
  level: integer('level').default(1),
  reward_uni: text('reward_uni').default('0'),
  created_at: timestamp('created_at').defaultNow()
});

export const sessions = pgTable('sessions', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => users.id),
  token: text('token').notNull(),
  expires_at: timestamp('expires_at').notNull(),
  is_active: boolean('is_active').notNull().default(true),
  created_at: timestamp('created_at').notNull().defaultNow()
}); 