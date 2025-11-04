# Integration Testing Guide

**Target**: Service ↔ Store ↔ SQLite flows
**Coverage Goal**: ≥85% for key user flows
**Speed**: 100-500ms per test
**Database**: Real in-memory SQLite (better-sqlite3)

---

## What to Test

Integration tests exercise the full service layer with a real database:

- **Log Flow**: Load logs → Add log → Update log → Delete log → Verify persistence
- **Settings Flow**: Load settings → Update cost → Verify statistics update
- **Statistics**: Add logs across time → Calculate daily/weekly/monthly → Verify accuracy

---

## The Unmock & Rebind Pattern

Integration tests must **unmock src/db** to use real SQLite. Follow this exact order:

```typescript
// __tests__/integration/logFlow.test.ts

// STEP 1: Unmock BEFORE any imports
jest.unmock('../../src/db');
// Keep expo-sqlite mocked - real native module won't load in Node

// STEP 2: Import test helpers
import { createTestDb } from '../helpers/testDb';
import { resetStores } from '../helpers/testUtils';

describe('LogService Integration', () => {
  let testDb: ReturnType<typeof createTestDb>;
  let LogService: any; // Type will be reassigned after mock swap

  // STEP 3: In beforeAll, create real DB and rebind module
  beforeAll(async () => {
    // Create in-memory SQLite
    testDb = createTestDb();

    // Clear module cache and re-mock src/db with real SQLite
    jest.resetModules();
    jest.doMock('../../src/db', () => ({
      db: testDb.db,                // Real Drizzle + better-sqlite3
      default: testDb.db,           // For default imports
      initializeDatabase: jest.fn(() => Promise.resolve(true)),
      resetDatabase: jest.fn(() => Promise.resolve(true)),
    }));

    // STEP 4: NOW import/require the service
    // It will see the real db binding
    const logServiceModule = await import('../../src/services/logService');
    LogService = logServiceModule.LogService;
  });

  // STEP 5: Cleanup after tests
  afterAll(() => {
    testDb.sqlite.close();
  });

  // ✅ Now tests use real SQLite
  it('persists log to SQLite', async () => {
    // ...test code...
  });
});
```

---

## Critical Order

1. `jest.unmock('../../src/db')` ← Before any imports
2. `jest.resetModules()` ← Clear module cache
3. `jest.doMock('../../src/db', ...)` ← Set up new mock with real SQLite
4. `await import()` ← Re-import services to bind new db instance
5. Run tests ← Services now use real SQLite

**Missing any step breaks the pattern.**

---

## Example: Complete Log Flow

```typescript
// __tests__/integration/logFlow.test.ts
jest.unmock('../../src/db');

import { createTestDb } from '../helpers/testDb';
import { resetStores } from '../helpers/testUtils';
import { createMockLog } from '../helpers/mockData';
import { cigaretteLogs } from '../../src/db/schema';
import { eq } from 'drizzle-orm';

describe('LogService Integration - Complete Flow', () => {
  let testDb: ReturnType<typeof createTestDb>;
  let LogService: any;

  beforeAll(async () => {
    testDb = createTestDb();

    jest.resetModules();
    jest.doMock('../../src/db', () => ({
      db: testDb.db,
      default: testDb.db,
      initializeDatabase: jest.fn(() => Promise.resolve(true)),
      resetDatabase: jest.fn(() => Promise.resolve(true)),
    }));

    const { LogService: LogServiceImpl } = await import(
      '../../src/services/logService'
    );
    LogService = LogServiceImpl;
  });

  afterAll(() => {
    testDb.sqlite.close();
  });

  beforeEach(() => {
    resetStores();
    // Clear database between tests
    testDb.sqlite.exec('DELETE FROM cigarette_logs');
  });

  it('adds log and persists to SQLite', async () => {
    const testLog = createMockLog({ notes: 'morning smoke' });

    // ACT: Add log via service
    const result = await LogService.addLog(testLog);

    // ASSERT: Verify returned
    expect(result.id).toBeDefined();

    // VERIFY: Query database directly to confirm persistence
    const persisted = testDb.db
      .select()
      .from(cigaretteLogs)
      .where(eq(cigaretteLogs.id, result.id))
      .all();

    expect(persisted).toHaveLength(1);
    expect(persisted[0].notes).toBe('morning smoke');
  });

  it('updates log in SQLite', async () => {
    // Setup: Insert log
    const testLog = createMockLog({ id: 'log-1', notes: 'initial' });
    await LogService.addLog(testLog);

    // ACT: Update log
    await LogService.updateLog('log-1', { notes: 'updated' });

    // VERIFY: Check database
    const updated = testDb.db
      .select()
      .from(cigaretteLogs)
      .where(eq(cigaretteLogs.id, 'log-1'))
      .all();

    expect(updated[0].notes).toBe('updated');
  });

  it('deletes log from SQLite', async () => {
    // Setup: Insert log
    const testLog = createMockLog({ id: 'log-1' });
    await LogService.addLog(testLog);

    // ACT: Delete log
    await LogService.deleteLog('log-1');

    // VERIFY: Confirm deleted from database
    const deleted = testDb.db
      .select()
      .from(cigaretteLogs)
      .where(eq(cigaretteLogs.id, 'log-1'))
      .all();

    expect(deleted).toHaveLength(0);
  });
});
```

---

## Testing Settings Persistence

```typescript
// __tests__/integration/settingsFlow.test.ts
jest.unmock('../../src/db');

import { createTestDb } from '../helpers/testDb';
import { createMockSettings } from '../helpers/mockData';
import { settings } from '../../src/db/schema';

describe('SettingsService Integration', () => {
  let testDb: ReturnType<typeof createTestDb>;
  let SettingsService: any;

  beforeAll(async () => {
    testDb = createTestDb();

    jest.resetModules();
    jest.doMock('../../src/db', () => ({
      db: testDb.db,
      default: testDb.db,
      initializeDatabase: jest.fn(() => Promise.resolve(true)),
      resetDatabase: jest.fn(() => Promise.resolve(true)),
    }));

    const module = await import('../../src/services/settingsService');
    SettingsService = module.SettingsService;
  });

  afterAll(() => {
    testDb.sqlite.close();
  });

  it('persists settings update to SQLite', async () => {
    // Setup: Create initial settings
    const initial = createMockSettings({
      costPerCigarette: 0.5,
      currencySymbol: '$',
    });
    await SettingsService.createDefaultSettings();

    // ACT: Update cost
    await SettingsService.updateSetting('costPerCigarette', 1.0);

    // VERIFY: Check database
    const updated = testDb.db.select().from(settings).all();
    expect(updated[0].costPerCigarette).toBe(1.0);
  });
});
```

---

## Testing Statistics with Real Data

```typescript
// __tests__/integration/statisticsFlow.test.ts
describe('Statistics with Real Data', () => {
  let testDb: ReturnType<typeof createTestDb>;
  let LogService: any;
  let StatisticsService: any;

  beforeAll(async () => {
    testDb = createTestDb();
    // ... unmock and rebind pattern ...
  });

  it('calculates daily stats from persisted logs', async () => {
    // Setup: Add multiple logs
    await LogService.addLog(createMockLog({ timestamp: Date.now() }));
    await LogService.addLog(createMockLog({ timestamp: Date.now() - 3600000 })); // 1h ago

    // ACT: Calculate stats
    const stats = StatisticsService.getTodayStats();

    // ASSERT: Should have 2 cigarettes
    expect(stats.total).toBe(2);
  });
});
```

---

## Cleanup Between Tests

Always clean the database between test cases to ensure isolation:

```typescript
beforeEach(() => {
  resetStores();

  // Clear all tables
  testDb.sqlite.exec('DELETE FROM cigarette_logs');
  testDb.sqlite.exec('DELETE FROM settings');
});
```

---

## Running Integration Tests

```bash
# Run all tests (unit + integration)
npm test

# Run only integration tests
npm test -- integration

# Run specific integration file
npm test -- logFlow.test.ts

# Watch mode
npm run test:watch
```

---

## Verifying Database State

Query the test database directly to verify persistence:

```typescript
import { cigaretteLogs } from '../../src/db/schema';
import { eq } from 'drizzle-orm';

// Query: Get log by ID
const log = testDb.db
  .select()
  .from(cigaretteLogs)
  .where(eq(cigaretteLogs.id, 'log-123'))
  .all();

// Query: Get all logs
const allLogs = testDb.db.select().from(cigaretteLogs).all();

// Query: Count logs
const count = testDb.db
  .select()
  .from(cigaretteLogs)
  .all()
  .length;
```

---

## Common Issues

**"Cannot find module '../../src/db'"**
→ Double-check relative path. From `__tests__/integration/`, `../../` reaches root.

**"db.select is not a function"**
→ The module rebind didn't work. Verify `jest.unmock()` comes before imports.

**"SQLite table doesn't exist"**
→ `createTestDb()` creates tables. Verify it's being called in `beforeAll()`.

**Tests hanging**
→ Missing `testDb.sqlite.close()` in `afterAll()`. Always clean up.

---

## Next Steps

→ See **[SCREEN_TESTING.md](./SCREEN_TESTING.md)** for testing React Native components with real stores
