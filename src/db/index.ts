import * as SQLite from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from './schema';

// Open database connection
const database = SQLite.openDatabaseSync('vibekeeper.db');

// Initialize Drizzle ORM
export const db = drizzle(database, { schema });

/**
 * Initialize database tables
 * Creates tables if they don't exist
 */
export async function initializeDatabase() {
  try {
    // Create cigarette_logs table
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS cigarette_logs (
        id TEXT PRIMARY KEY,
        timestamp INTEGER NOT NULL,
        notes TEXT,
        time TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );
    `);

    // Create settings table
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS settings (
        id TEXT PRIMARY KEY,
        cost_per_cigarette REAL NOT NULL DEFAULT 0.5,
        currency_symbol TEXT NOT NULL DEFAULT '$',
        daily_goal INTEGER,
        notifications_enabled INTEGER NOT NULL DEFAULT 1,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );
    `);

    // Create indexes for better query performance
    await database.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_cigarette_logs_timestamp
      ON cigarette_logs(timestamp);
    `);

    console.log('Database initialized successfully');
    return true;
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

/**
 * Reset database (for development/testing)
 */
export async function resetDatabase() {
  try {
    await database.execAsync(`
      DROP TABLE IF EXISTS cigarette_logs;
      DROP TABLE IF EXISTS settings;
    `);
    await initializeDatabase();
    console.log('Database reset successfully');
  } catch (error) {
    console.error('Database reset error:', error);
    throw error;
  }
}

export default db;
