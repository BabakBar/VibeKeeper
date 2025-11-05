import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

/**
 * Cigarette Logs Table
 * Stores individual cigarette smoking records
 */
export const cigaretteLogs = sqliteTable('cigarette_logs', {
  id: text('id').primaryKey(),
  timestamp: integer('timestamp').notNull(), // Unix timestamp of when smoked
  notes: text('notes'), // Optional notes
  time: text('time'), // Optional time in HH:mm format
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

/**
 * Settings Table
 * Stores user preferences and configuration
 */
export const settings = sqliteTable('settings', {
  id: text('id').primaryKey(),
  costPerCigarette: real('cost_per_cigarette').notNull().default(7.5), // Default €7.50
  currencySymbol: text('currency_symbol').notNull().default('€'),
  dailyGoal: integer('daily_goal'), // Optional daily limit
  notificationsEnabled: integer('notifications_enabled').notNull().default(1), // Boolean as int
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

// Type exports for use in the app
export type CigaretteLog = typeof cigaretteLogs.$inferSelect;
export type CigaretteLogInsert = typeof cigaretteLogs.$inferInsert;
export type Settings = typeof settings.$inferSelect;
export type SettingsInsert = typeof settings.$inferInsert;
