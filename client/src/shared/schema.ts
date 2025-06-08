import { pgTable, text, serial, integer, boolean, bigint, timestamp, numeric, json, jsonb, varchar, index } from "drizzle-orm/pg-core";
import { z } from "zod";

// Таблица с аутентификацией по имени пользователя и паролю (пароль не обязателен для Telegram)
export const authUsers = pgTable("auth_users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").default('telegram_auth'), // Устанавливаем значение по умолчанию
});

// Таблица users по требованиям задачи
export const users = pgTable(
  "users", 
  {
    id: serial("id").primaryKey(),
    telegram_id: bigint("telegram_id", { mode: "number" }).unique(),
    guest_id: text("guest_id").unique(), // Уникальный идентификатор пользователя, независимый от Telegram
    username: text("username"),
    wallet: text("wallet"),
    ton_wallet_address: text("ton_wallet_address"), // Новое поле для хранения TON-адреса кошелька
    ref_code: text("ref_code").unique(), // Уникальный реферальный код для пользователя
    parent_ref_code: text("parent_ref_code"), // Реферальный код пригласившего пользователя
    balance_uni: numeric("balance_uni", { precision: 18, scale: 6 }).default("0"),
    balance_ton: numeric("balance_ton", { precision: 18, scale: 6 }).default("0"),
    // Поля для основного UNI фарминга
    uni_deposit_amount: numeric("uni_deposit_amount", { precision: 18, scale: 6 }).default("0"),
    uni_farming_start_timestamp: timestamp("uni_farming_start_timestamp"),
    uni_farming_balance: numeric("uni_farming_balance", { precision: 18, scale: 6 }).default("0"),
    uni_farming_rate: numeric("uni_farming_rate", { precision: 18, scale: 6 }).default("0"),
    uni_farming_last_update: timestamp("uni_farming_last_update"),
    // Поля для совместимости со старой системой фарминга (используются в миграции)
    uni_farming_deposit: numeric("uni_farming_deposit", { precision: 18, scale: 6 }).default("0"),
    uni_farming_activated_at: timestamp("uni_farming_activated_at"),
    created_at: timestamp("created_at").defaultNow(),
    checkin_last_date: timestamp("checkin_last_date"),
    checkin_streak: integer("checkin_streak").default(0)
  },
  (table) => {
    return {
      // Создаем индекс для parent_ref_code для оптимизации реферальных запросов
      parentRefCodeIdx: index("idx_users_parent_ref_code").on(table.parent_ref_code),
      // Индекс для ref_code уже есть (из-за unique), но для явности добавим
      refCodeIdx: index("idx_users_ref_code").on(table.ref_code),
    };
  }
);

// Таблица farming_deposits по требованиям задачи
export const farmingDeposits = pgTable("farming_deposits", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => users.id),
  amount_uni: numeric("amount_uni", { precision: 18, scale: 6 }),
  rate_uni: numeric("rate_uni", { precision: 5, scale: 2 }),
  rate_ton: numeric("rate_ton", { precision: 5, scale: 2 }),
  created_at: timestamp("created_at").defaultNow(),
  last_claim: timestamp("last_claim"),
  is_boosted: boolean("is_boosted").default(false),
  deposit_type: text("deposit_type").default("regular"), // regular, boost_1, boost_5, boost_15, boost_25
  boost_id: integer("boost_id"), // ID буст-пакета (1, 2, 3, 4)
  expires_at: timestamp("expires_at") // Для буст-пакетов (срок 365 дней)
});

// Схемы для аутентификации
export const insertAuthUserSchema = z.object({
  username: z.string(), // text().notNull()
  password: z.string().optional(), // text().default()
});

export type InsertAuthUser = z.infer<typeof insertAuthUserSchema>;
export type AuthUser = typeof authUsers.$inferSelect;

// Схемы для таблицы users
export const insertUserSchema = z.object({
  telegram_id: z.number().optional(), // bigint({ mode: "number" }).unique()
  guest_id: z.string().optional(), // text().unique()
  username: z.string().optional(), // text()
  wallet: z.string().optional(), // text()
  ton_wallet_address: z.string().optional(), // text()
  ref_code: z.string().optional(), // text().unique()
  parent_ref_code: z.string().optional(), // text()
  // Вставляемые поля balance_uni, balance_ton имеют default значения, не требуются при insert
  // uni_deposit_amount, uni_farming_balance, uni_farming_rate, uni_farming_deposit имеют default
  // timestamp поля created_at, checkin_last_date, uni_farming_start_timestamp, uni_farming_last_update, uni_farming_activated_at необязательны или имеют default
  // checkin_streak имеет default
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Схемы для таблицы farming_deposits
export const insertFarmingDepositSchema = z.object({
  user_id: z.number().optional(), // integer().references()
  amount_uni: z.string().optional(), // numeric()
  rate_uni: z.string().optional(), // numeric()
  rate_ton: z.string().optional(), // numeric()
  last_claim: z.date().optional(), // timestamp()
  is_boosted: z.boolean().optional(), // boolean().default()
  deposit_type: z.string().optional(), // text().default()
  boost_id: z.number().optional(), // integer()
  expires_at: z.date().optional(), // timestamp()
});

export type InsertFarmingDeposit = z.infer<typeof insertFarmingDepositSchema>;
export type FarmingDeposit = typeof farmingDeposits.$inferSelect;

// Таблица transactions по требованиям задачи
export const transactions = pgTable(
  "transactions", 
  {
    id: serial("id").primaryKey(),
    user_id: integer("user_id").references(() => users.id),
    transaction_type: text("transaction_type"), // deposit / withdraw / reward / boost_bonus
    currency: text("currency"), // UNI / TON
    amount: numeric("amount", { precision: 18, scale: 6 }),
    status: text("status").default("confirmed"), // pending / confirmed / rejected
    source: text("source"), // источник транзакции (например, "TON Boost")
    category: text("category"), // категория транзакции (например, "bonus")
    tx_hash: text("tx_hash"), // хеш транзакции для блокчейн-операций
    description: text("description"), // описание транзакции
    source_user_id: integer("source_user_id"), // ID пользователя-источника (например, реферала)
    wallet_address: text("wallet_address"), // адрес кошелька для вывода средств
    data: text("data"), // JSON-строка с дополнительными данными транзакции
    created_at: timestamp("created_at").defaultNow()
  },
  (table) => {
    return {
      // Индексы для ускорения запросов к транзакциям
      userIdIdx: index("idx_transactions_user_id").on(table.user_id),
      sourceUserIdIdx: index("idx_transactions_source_user_id").on(table.source_user_id),
      typeStatusIdx: index("idx_transactions_type_status").on(table.transaction_type, table.status),
    };
  }
);

// Схемы для таблицы transactions
export const insertTransactionSchema = z.object({
  user_id: z.number().optional(),
  transaction_type: z.string().optional(),
  currency: z.string().optional(),
  amount: z.string().optional(), // numeric в Drizzle -> string в Zod
  status: z.string().optional(),
  source: z.string().optional(),
  category: z.string().optional(),
  tx_hash: z.string().optional(),
  description: z.string().optional(),
  source_user_id: z.number().optional(),
  wallet_address: z.string().optional(),
  data: z.string().optional(),
  created_at: z.date().optional(),
});

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

// Таблица referrals по требованиям задачи
export const referrals = pgTable(
  "referrals",
  {
    id: serial("id").primaryKey(),
    user_id: integer("user_id").references(() => users.id).notNull(),
    inviter_id: integer("inviter_id").references(() => users.id).notNull(),
    level: integer("level").notNull(), // Уровень (1–20)
    reward_uni: numeric("reward_uni", { precision: 18, scale: 6 }),
    ref_path: json("ref_path").array(), // Массив ID пригласителей в цепочке [inviter_id, inviter_inviter_id, ...]
    created_at: timestamp("created_at").defaultNow()
  },
  (table) => {
    return {
      // Индексы для ускорения реферальных запросов
      userIdIdx: index("idx_referrals_user_id").on(table.user_id),
      inviterIdIdx: index("idx_referrals_inviter_id").on(table.inviter_id),
      userInviterIdx: index("idx_referrals_user_inviter").on(table.user_id, table.inviter_id),
      levelIdx: index("idx_referrals_level").on(table.level),
    };
  }
);

// Схемы для таблицы referrals
export const insertReferralSchema = z.object({
  user_id: z.number(), // integer().notNull()
  inviter_id: z.number(), // integer().notNull()
  level: z.number(), // integer().notNull()
  reward_uni: z.string().optional(), // numeric
  ref_path: z.array(z.number()).optional(), // json().array()
  created_at: z.date().optional(), // timestamp().defaultNow()
});

export type InsertReferral = z.infer<typeof insertReferralSchema>;
export type Referral = typeof referrals.$inferSelect;

// Таблица missions по требованиям задачи
export const missions = pgTable("missions", {
  id: serial("id").primaryKey(),
  type: text("type"), // Тип миссии: invite / social / check-in / deposit и т.д.
  title: text("title"), // Название миссии
  description: text("description"), // Подробное описание
  reward_uni: numeric("reward_uni", { precision: 18, scale: 6 }), // Награда в UNI
  is_active: boolean("is_active").default(true) // Активна ли миссия
});

// Схемы для таблицы missions
export const insertMissionSchema = z.object({
  type: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  reward_uni: z.string().optional(), // numeric
  is_active: z.boolean().optional(), // boolean().default(true)
});

export type InsertMission = z.infer<typeof insertMissionSchema>;
export type Mission = typeof missions.$inferSelect;

// Таблица user_missions для отслеживания выполнения миссий пользователями
export const userMissions = pgTable("user_missions", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => users.id),
  mission_id: integer("mission_id").references(() => missions.id),
  progress: integer("progress").default(0), // Прогресс выполнения миссии
  is_completed: boolean("is_completed").default(false),
  completed_at: timestamp("completed_at"),
  claimed_reward: boolean("claimed_reward").default(false),
  created_at: timestamp("created_at").defaultNow()
});

// Схемы для таблицы user_missions
export const insertUserMissionSchema = z.object({
  user_id: z.number().optional(),
  mission_id: z.number().optional(),
  progress: z.number().optional(),
  is_completed: z.boolean().optional(),
  completed_at: z.date().optional(),
  claimed_reward: z.boolean().optional(),
  created_at: z.date().optional(),
});

export type InsertUserMission = z.infer<typeof insertUserMissionSchema>;
export type UserMission = typeof userMissions.$inferSelect;

// Таблица для хранения UNI фарминг-депозитов
export const uniFarmingDeposits = pgTable("uni_farming_deposits", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull().references(() => users.id),
  amount: numeric("amount", { precision: 18, scale: 6 }).notNull(), // Сумма UNI в депозите
  created_at: timestamp("created_at").defaultNow().notNull(), // Дата открытия
  rate_per_second: numeric("rate_per_second", { precision: 20, scale: 18 }).notNull(), // Расчетная скорость фарминга
  last_updated_at: timestamp("last_updated_at").defaultNow().notNull(), // Время последнего начисления
  is_active: boolean("is_active").default(true), // Активен ли депозит
});

// Схемы для таблицы uni_farming_deposits
export const insertUniFarmingDepositSchema = z.object({
  user_id: z.number(),
  amount: z.string(), // numeric().notNull()
  created_at: z.date().optional(), // timestamp().defaultNow().notNull()
  rate_per_second: z.string(), // numeric().notNull()
  last_updated_at: z.date().optional(), // timestamp().defaultNow().notNull()
  is_active: z.boolean().optional(), // boolean().default(true)
});

export type InsertUniFarmingDeposit = z.infer<typeof insertUniFarmingDepositSchema>;
export type UniFarmingDeposit = typeof uniFarmingDeposits.$inferSelect;

// Таблица для хранения UNI Boost-депозитов
export const boostDeposits = pgTable("boost_deposits", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull().references(() => users.id),
  amount: numeric("amount", { precision: 18, scale: 6 }).notNull(),
  daily_rate: numeric("daily_rate", { precision: 5, scale: 4 }).notNull(),
  start_date: timestamp("start_date").defaultNow().notNull(),
  end_date: timestamp("end_date").notNull(),
  last_claim: timestamp("last_claim"),
  total_earned: numeric("total_earned", { precision: 18, scale: 6 }).default("0"),
  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at").defaultNow().notNull()
});

// Схемы для таблицы boost_deposits
export const insertBoostDepositSchema = z.object({
  user_id: z.number(), // integer().notNull()
  amount: z.string(), // numeric().notNull()
  daily_rate: z.string(), // numeric().notNull()
  start_date: z.date().optional(), // timestamp().defaultNow().notNull()
  end_date: z.date(), // timestamp().notNull()
  last_claim: z.date().optional(), // timestamp()
  total_earned: z.string().optional(), // numeric().default("0")
  is_active: z.boolean().optional(), // boolean().default(true)
  created_at: z.date().optional(), // timestamp().defaultNow().notNull()
});

export type InsertBoostDeposit = z.infer<typeof insertBoostDepositSchema>;
export type BoostDeposit = typeof boostDeposits.$inferSelect;

// Таблица ton_boost_deposits для отслеживания активных TON Boost депозитов
export const tonBoostDeposits = pgTable("ton_boost_deposits", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull().references(() => users.id),
  package_id: integer("package_id").notNull().references(() => tonBoostPackages.id),
  deposit_ton_amount: numeric("deposit_ton_amount", { precision: 18, scale: 5 }).notNull(),
  bonus_uni_amount: numeric("bonus_uni_amount", { precision: 18, scale: 6 }).notNull(),
  start_date: timestamp("start_date").defaultNow().notNull(),
  end_date: timestamp("end_date").notNull(),
  last_claim_date: timestamp("last_claim_date"),
  total_uni_earned: numeric("total_uni_earned", { precision: 18, scale: 6 }).default("0"),
  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at").defaultNow().notNull()
});

// Схемы для таблицы ton_boost_deposits
export const insertTonBoostDepositSchema = z.object({
  user_id: z.number(), // integer().notNull()
  package_id: z.number(), // integer().notNull()
  deposit_ton_amount: z.string(), // numeric().notNull()
  bonus_uni_amount: z.string(), // numeric().notNull()
  start_date: z.date().optional(), // timestamp().defaultNow().notNull()
  end_date: z.date(), // timestamp().notNull()
  last_claim_date: z.date().optional(), // timestamp()
  total_uni_earned: z.string().optional(), // numeric().default("0")
  is_active: z.boolean().optional(), // boolean().default(true)
  created_at: z.date().optional(), // timestamp().defaultNow().notNull()
});

export type InsertTonBoostDeposit = z.infer<typeof insertTonBoostDepositSchema>;
export type TonBoostDeposit = typeof tonBoostDeposits.$inferSelect;

// Таблица для логирования запусков Mini App (Этап 5.1)
export const launchLogs = pgTable("launch_logs", {
  id: serial("id").primaryKey(),
  telegram_user_id: bigint("telegram_user_id", { mode: "number" }),
  ref_code: text("ref_code"),
  platform: text("platform"), // android / ios / web / unknown
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  user_agent: text("user_agent"),
  init_data: text("init_data"),
  ip_address: text("ip_address"),
  request_id: text("request_id"), // Для отслеживания уникальных запросов
  user_id: integer("user_id").references(() => users.id) // Связь с таблицей пользователей (если есть)
});

// Схемы для таблицы launch_logs
export const insertLaunchLogSchema = z.object({
  telegram_user_id: z.number().optional(), // bigint without notNull() is optional number
  ref_code: z.string().optional(), // text without notNull() is optional string
  platform: z.string().optional(), // text without notNull() is optional string
  timestamp: z.date(), // timestamp with .notNull() is required date
  user_agent: z.string().optional(), // text without notNull() is optional string
  init_data: z.string().optional(), // text without notNull() is optional string
  ip_address: z.string().optional(), // text without notNull() is optional string
  request_id: z.string().optional(), // text without notNull() is optional string
  user_id: z.number().optional(), // integer without notNull() is optional number
});

export type InsertLaunchLog = z.infer<typeof insertLaunchLogSchema>;
export type LaunchLog = typeof launchLogs.$inferSelect;

// Таблица для логирования операций с партициями
export const partition_logs = pgTable("partition_logs", {
  id: serial("id").primaryKey(),
  operation: text("operation").notNull(), // CREATE, DROP, INFO, ERROR
  partition_name: text("partition_name"),
  message: text("message").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  status: text("status").notNull(), // success, error
  error_details: text("error_details")
});

// Схемы для таблицы partition_logs
export const insertPartitionLogSchema = z.object({
  operation: z.string(), // text().notNull()
  partition_name: z.string().optional(), // text()
  message: z.string(), // text().notNull()
  timestamp: z.date().optional(), // timestamp().defaultNow().notNull()
  status: z.string(), // text().notNull()
  error_details: z.string().optional(), // text()
});

export type InsertPartitionLog = z.infer<typeof insertPartitionLogSchema>;
export type PartitionLog = typeof partition_logs.$inferSelect;

// Таблица для логов распределения реферальных вознаграждений
export const reward_distribution_logs = pgTable("reward_distribution_logs", {
  id: serial("id").primaryKey(),
  batch_id: text("batch_id").notNull(), // Уникальный ID пакета операций
  source_user_id: integer("source_user_id").notNull(), // ID пользователя, от которого идёт распределение
  earned_amount: numeric("earned_amount", { precision: 18, scale: 6 }).notNull(), // Сумма исходного действия
  currency: text("currency").notNull(), // Валюта (UNI/TON)
  processed_at: timestamp("processed_at"), // Время обработки сообщения
  status: text("status").default("pending"), // pending / completed / failed
  levels_processed: integer("levels_processed"), // Количество обработанных уровней
  inviter_count: integer("inviter_count"), // Количество пригласителей
  total_distributed: numeric("total_distributed", { precision: 18, scale: 6 }), // Общая распределенная сумма
  error_message: text("error_message"), // Ошибка при обработке, если была
  completed_at: timestamp("completed_at") // Время завершения обработки
});

// Схемы для таблицы reward_distribution_logs
export const insertRewardDistributionLogSchema = z.object({
  batch_id: z.string(), // text().notNull()
  source_user_id: z.number(), // integer().notNull()
  earned_amount: z.string(), // numeric().notNull()
  currency: z.string(), // text().notNull()
  processed_at: z.date().optional(), // timestamp()
  status: z.string().optional(), // text().default("pending")
  levels_processed: z.number().optional(), // integer()
  inviter_count: z.number().optional(), // integer()
  total_distributed: z.string().optional(), // numeric()
  error_message: z.string().optional(), // text()
  completed_at: z.date().optional(), // timestamp()
});

export type InsertRewardDistributionLog = z.infer<typeof insertRewardDistributionLogSchema>;
export type RewardDistributionLog = typeof reward_distribution_logs.$inferSelect;

// Таблица для метрик производительности
export const performance_metrics = pgTable(
  "performance_metrics", 
  {
    id: serial("id").primaryKey(),
    operation: text("operation").notNull(), // Тип операции (process_batch, queue_reward, и т.д.)
    batch_id: text("batch_id"), // ID связанного пакета распределения
    duration_ms: numeric("duration_ms", { precision: 12, scale: 2 }).notNull(), // Длительность операции в миллисекундах
    timestamp: timestamp("timestamp").defaultNow().notNull(), // Время записи метрики
    details: text("details") // Дополнительные детали (JSON-строка)
  },
  (table) => {
    return {
      // Индексы для эффективного анализа метрик производительности
      timestampIdx: index("idx_performance_metrics_timestamp").on(table.timestamp),
      operationIdx: index("idx_performance_metrics_operation").on(table.operation),
      batchIdIdx: index("idx_performance_metrics_batch_id").on(table.batch_id),
    };
  }
);

// Схемы для таблицы performance_metrics
export const insertPerformanceMetricSchema = z.object({
  operation: z.string(), // text().notNull()
  batch_id: z.string().optional(), // text()
  duration_ms: z.string(), // numeric().notNull()
  timestamp: z.date().optional(), // timestamp().defaultNow().notNull()
  details: z.string().optional(), // text()
});

export type InsertPerformanceMetric = z.infer<typeof insertPerformanceMetricSchema>;
export type PerformanceMetric = typeof performance_metrics.$inferSelect;

// Таблица boost_packages для хранения доступных буст-пакетов
export const boostPackages = pgTable("boost_packages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price_uni: numeric("price_uni", { precision: 18, scale: 6 }).notNull(),
  rate_multiplier: numeric("rate_multiplier", { precision: 5, scale: 2 }).notNull(),
  duration_days: integer("duration_days").default(365),
  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at").defaultNow()
});

// Схемы для таблицы boost_packages
export const insertBoostPackageSchema = z.object({
  name: z.string(), // text().notNull()
  description: z.string().optional(), // text()
  price_uni: z.string(), // numeric().notNull()
  rate_multiplier: z.string(), // numeric().notNull()
  duration_days: z.number().optional(), // integer().default(365)
  is_active: z.boolean().optional(), // boolean().default(true)
  created_at: z.date().optional(), // timestamp().defaultNow()
});

export type InsertBoostPackage = z.infer<typeof insertBoostPackageSchema>;
export type BoostPackage = typeof boostPackages.$inferSelect;

// Таблица user_boosts для отслеживания активных бустов пользователей
export const userBoosts = pgTable("user_boosts", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull().references(() => users.id),
  package_id: integer("package_id").notNull().references(() => boostPackages.id),
  amount: numeric("amount", { precision: 18, scale: 6 }).notNull(),
  daily_rate: numeric("daily_rate", { precision: 5, scale: 4 }).notNull(),
  start_date: timestamp("start_date").defaultNow().notNull(),
  end_date: timestamp("end_date").notNull(),
  last_claim: timestamp("last_claim"),
  total_earned: numeric("total_earned", { precision: 18, scale: 6 }).default("0"),
  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at").defaultNow().notNull()
});

// Схемы для таблицы user_boosts
export const insertUserBoostSchema = z.object({
  user_id: z.number(), // integer().notNull()
  package_id: z.number(), // integer().notNull()
  amount: z.string(), // numeric().notNull()
  daily_rate: z.string(), // numeric().notNull()
  start_date: z.date().optional(), // timestamp().defaultNow().notNull()
  end_date: z.date(), // timestamp().notNull()
  last_claim: z.date().optional(), // timestamp()
  total_earned: z.string().optional(), // numeric().default("0")
  is_active: z.boolean().optional(), // boolean().default(true)
  created_at: z.date().optional(), // timestamp().defaultNow().notNull()
});

export type InsertUserBoost = z.infer<typeof insertUserBoostSchema>;
export type UserBoost = typeof userBoosts.$inferSelect;

// Таблица ton_boost_packages для конфигурации TON Boost пакетов
export const tonBoostPackages = pgTable("ton_boost_packages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // Starter Boost, Standard Boost, Advanced Boost, Premium Boost
  description: text("description"),
  price_ton: numeric("price_ton", { precision: 18, scale: 5 }).notNull(), // Стоимость в TON
  bonus_uni: numeric("bonus_uni", { precision: 18, scale: 6 }).notNull(), // Единоразовый бонус UNI
  daily_rate: numeric("daily_rate", { precision: 5, scale: 3 }).notNull(), // Ставка в день (0.005, 0.01, 0.02, 0.025)
  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at").defaultNow()
});

// Схемы для таблицы ton_boost_packages
export const insertTonBoostPackageSchema = z.object({
  name: z.string(), // text().notNull()
  description: z.string().optional(), // text()
  price_ton: z.string(), // numeric().notNull()
  bonus_uni: z.string(), // numeric().notNull()
  daily_rate: z.string(), // numeric().notNull()
  is_active: z.boolean().optional(), // boolean().default(true)
  created_at: z.date().optional(), // timestamp().defaultNow()
});

export type InsertTonBoostPackage = z.infer<typeof insertTonBoostPackageSchema>;
export type TonBoostPackage = typeof tonBoostPackages.$inferSelect;