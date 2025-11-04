/**
 * Integration tests for Services with SQLite
 *
 * Tests LogService and SettingsService with real database operations
 * using the unmock/rebind pattern.
 *
 * Run with: npm run test:integration:services
 * (requires --experimental-vm-modules Node.js flag)
 */

jest.unmock('../../src/db');

import { createTestDb } from '../helpers/testDb';
import { createMockLog, createMockLogs } from '../helpers/mockData';
import { cigaretteLogs, settings } from '../../src/db/schema';
import { eq } from 'drizzle-orm';

describe('Integration: LogService with SQLite', () => {
  let testDb: ReturnType<typeof createTestDb>;
  let LogService: any;

  beforeAll(async () => {
    testDb = createTestDb();

    // Reset modules to ensure clean state
    jest.resetModules();

    // Mock the database module to use test database
    jest.doMock('../../src/db', () => ({
      db: testDb.db,
      default: testDb.db,
      initializeDatabase: jest.fn(() => Promise.resolve(true)),
      resetDatabase: jest.fn(() => Promise.resolve(true)),
    }));

    // Now import LogService after mocking
    const logServiceModule = await import('../../src/services/logService');
    LogService = logServiceModule.LogService;
  });

  beforeEach(() => {
    testDb.sqlite.exec('DELETE FROM cigarette_logs');
  });

  afterAll(() => {
    testDb.sqlite.close();
    jest.unmock('../../src/db');
  });

  it('persists new log to SQLite when addLog is called', async () => {
    const result = await LogService.addLog({
      notes: 'Integration test log',
      timestamp: Date.now(),
    });

    // Verify the log was persisted to database
    const persisted = testDb.db
      .select()
      .from(cigaretteLogs)
      .where(eq(cigaretteLogs.id, result.id))
      .all();

    expect(persisted).toHaveLength(1);
    expect(persisted[0].notes).toBe('Integration test log');
  });

  it('retrieves logs from SQLite when loadLogs is called', async () => {
    // Insert test logs directly
    const logs = createMockLogs(3);
    logs.forEach((log) => {
      testDb.db.insert(cigaretteLogs).values({
        id: log.id,
        timestamp: log.timestamp,
        notes: log.notes || null,
        time: log.time || null,
        created_at: log.createdAt,
        updated_at: log.updatedAt,
      });
    });

    // Load logs via service
    const loaded = await LogService.loadLogs();

    expect(loaded).toHaveLength(3);
  });

  it('deletes log from SQLite when deleteLog is called', async () => {
    // Insert a log
    const log = createMockLog();
    testDb.db.insert(cigaretteLogs).values({
      id: log.id,
      timestamp: log.timestamp,
      notes: log.notes || null,
      time: log.time || null,
      created_at: log.createdAt,
      updated_at: log.updatedAt,
    });

    // Delete via service
    await LogService.deleteLog(log.id);

    // Verify deleted
    const persisted = testDb.db
      .select()
      .from(cigaretteLogs)
      .where(eq(cigaretteLogs.id, log.id))
      .all();

    expect(persisted).toHaveLength(0);
  });
});

describe('Integration: SettingsService with SQLite', () => {
  let testDb: ReturnType<typeof createTestDb>;
  let SettingsService: any;

  beforeAll(async () => {
    testDb = createTestDb();

    // Reset modules to ensure clean state
    jest.resetModules();

    // Mock the database module to use test database
    jest.doMock('../../src/db', () => ({
      db: testDb.db,
      default: testDb.db,
      initializeDatabase: jest.fn(() => Promise.resolve(true)),
      resetDatabase: jest.fn(() => Promise.resolve(true)),
    }));

    // Now import SettingsService after mocking
    const settingsServiceModule = await import('../../src/services/settingsService');
    SettingsService = settingsServiceModule.SettingsService;
  });

  beforeEach(() => {
    testDb.sqlite.exec('DELETE FROM settings');
  });

  afterAll(() => {
    testDb.sqlite.close();
    jest.unmock('../../src/db');
  });

  it('creates default settings when loading for first time', async () => {
    const loaded = await SettingsService.loadSettings();

    // Verify defaults were created
    expect(loaded.costPerCigarette).toBe(0.5);
    expect(loaded.currencySymbol).toBe('$');

    // Verify persisted to database
    const persisted = testDb.db
      .select()
      .from(settings)
      .where(eq(settings.id, 'default_settings'))
      .all();

    expect(persisted).toHaveLength(1);
  });

  it('updates settings in SQLite', async () => {
    // Create initial settings
    await SettingsService.loadSettings();

    // Update via service
    await SettingsService.updateSettings({
      costPerCigarette: 1.5,
      currencySymbol: '€',
    });

    // Verify updated in database
    const persisted = testDb.db
      .select()
      .from(settings)
      .where(eq(settings.id, 'default_settings'))
      .all();

    expect(persisted[0].cost_per_cigarette).toBe(1.5);
    expect(persisted[0].currency_symbol).toBe('€');
  });

  it('retrieves existing settings from SQLite', async () => {
    // Insert settings directly using snake_case column names
    const now = Date.now();
    testDb.db.insert(settings).values({
      id: 'default_settings',
      cost_per_cigarette: 2.0,
      currency_symbol: '£',
      daily_goal: 5,
      notifications_enabled: 1,
      created_at: now,
      updated_at: now,
    });

    // Load via service
    const loaded = await SettingsService.loadSettings();

    expect(loaded.costPerCigarette).toBe(2.0);
    expect(loaded.currencySymbol).toBe('£');
    expect(loaded.dailyGoal).toBe(5);
  });
});
