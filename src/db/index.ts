import { Platform } from 'react-native';
import * as schema from './schema';

// Conditional imports based on platform
let database: any = null;
let db: any = null;

// Only initialize SQLite on native platforms (iOS, Android)
if (Platform.OS !== 'web') {
  const SQLite = require('expo-sqlite');
  const { drizzle } = require('drizzle-orm/expo-sqlite');

  // Open database connection
  database = SQLite.openDatabaseSync('vibekeeper.db');

  // Initialize Drizzle ORM
  db = drizzle(database, { schema });
} else {
  // Web fallback: use in-memory mock
  db = {
    select: () => ({ from: () => Promise.resolve([]) }),
    insert: () => ({ values: () => Promise.resolve(null) }),
    update: () => ({ set: () => ({ where: () => Promise.resolve(null) }) }),
    delete: () => ({ from: () => Promise.resolve(null) }),
  };
}

export { db };

/**
 * Initialize database tables
 * Creates tables if they don't exist
 * On web, this is a no-op (uses in-memory mock)
 */
export async function initializeDatabase() {
  try {
    // Skip initialization on web
    if (Platform.OS === 'web') {
      console.log('Running on web - using in-memory database mock');
      return true;
    }

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
