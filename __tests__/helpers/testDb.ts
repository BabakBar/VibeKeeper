import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { cigaretteLogs, settings } from '../../src/db/schema';

/**
 * Creates a real in-memory SQLite database for integration tests.
 *
 * This is used when you unmock src/db in integration test suites.
 * It catches SQL errors, schema issues, and type mismatches that mocks can't detect.
 *
 * Usage:
 * ```typescript
 * jest.unmock('../../src/db');
 * const { db, sqlite } = createTestDb();
 * // ... run tests with real database
 * sqlite.close(); // Cleanup
 * ```
 */
export const createTestDb = () => {
  const sqlite = new Database(':memory:');
  const db = drizzle(sqlite);

  // Create tables matching the schema in src/db/schema.ts
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS cigarette_logs (
      id TEXT PRIMARY KEY,
      timestamp INTEGER NOT NULL,
      notes TEXT,
      time TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `);

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      id TEXT PRIMARY KEY,
      cost_per_cigarette REAL NOT NULL DEFAULT 0.5,
      currency_symbol TEXT NOT NULL DEFAULT '$',
      daily_goal INTEGER,
      notifications_enabled INTEGER NOT NULL DEFAULT 1,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `);

  // Create indexes for better query performance (matching production schema)
  sqlite.exec(`
    CREATE INDEX IF NOT EXISTS idx_cigarette_logs_timestamp
    ON cigarette_logs(timestamp)
  `);

  return { db, sqlite };
};

/**
 * Typical integration test structure:
 *
 * ```typescript
 * // __tests__/integration/logFlow.test.ts
 * jest.unmock('../../src/db');
 *
 * import { createTestDb } from '../helpers/testDb';
 *
 * describe('LogService Integration', () => {
 *   let testDb: ReturnType<typeof createTestDb>;
 *   let LogService: any;
 *
 *   beforeAll(async () => {
 *     testDb = createTestDb();
 *
 *     jest.resetModules();
 *     jest.doMock('../../src/db', () => ({
 *       db: testDb.db,
 *       default: testDb.db,
 *       initializeDatabase: jest.fn(() => Promise.resolve(true)),
 *       resetDatabase: jest.fn(() => Promise.resolve(true)),
 *     }));
 *
 *     const logServiceModule = await import('../../src/services/logService');
 *     LogService = logServiceModule.LogService;
 *   });
 *
 *   afterAll(() => {
 *     testDb.sqlite.close();
 *   });
 *
 *   it('persists log to SQLite', async () => {
 *     const result = await LogService.addLog({ notes: 'test' });
 *     const persisted = testDb.db.select().from(cigaretteLogs).all();
 *     expect(persisted).toHaveLength(1);
 *   });
 * });
 * ```
 */
