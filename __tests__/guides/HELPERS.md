# Test Helpers Reference

**Location**: `__tests__/helpers/`
**Purpose**: Shared utilities for all test layers
**Principle**: Pure functions, no implicit imports, explicitly imported where needed

---

## mockData.ts

Creates consistent test data. Use factories to reduce boilerplate.

### createMockLog(overrides?)

```typescript
import { createMockLog } from '../helpers/mockData';

// Default log
const log = createMockLog();
// Returns: {
//   id: 'log-abc123',
//   timestamp: 1700000000000,
//   notes: 'Test log',
//   time: '2025-01-15T12:00:00Z',
//   createdAt: 1700000000000,
//   updatedAt: 1700000000000
// }

// Custom values
const customLog = createMockLog({
  notes: 'With coffee',
  timestamp: Date.now(),
});
```

### createMockSettings(overrides?)

```typescript
import { createMockSettings } from '../helpers/mockData';

// Default settings
const settings = createMockSettings();
// Returns: {
//   id: 'settings-1',
//   costPerCigarette: 0.5,
//   currencySymbol: '$',
//   dailyGoal: 10,
//   notificationsEnabled: true,
//   createdAt: 1700000000000,
//   updatedAt: 1700000000000
// }

// Custom values
const customSettings = createMockSettings({
  costPerCigarette: 1.0,
  currencySymbol: '€',
});
```

### createMockLogs(count, overrides?)

```typescript
import { createMockLogs } from '../helpers/mockData';

// Create 5 logs with 1-minute spacing
const logs = createMockLogs(5);

// Create with custom values
const customLogs = createMockLogs(3, {
  notes: 'Afternoon break',
});
```

---

## mockDrizzle.ts

Chainable Drizzle mock for unit tests. Implements the builder pattern.

### createMockDrizzle()

```typescript
import { createMockDrizzle } from '../helpers/mockDrizzle';

// Already imported in jest.setup.js, available as:
import { db } from '../../src/db';

// Configure mock return values
(db as any)._mocks.all.mockResolvedValueOnce([log1, log2]);
(db as any)._mocks.run.mockResolvedValueOnce({ id: 'log-123' });

// Test code that uses db
const result = await LogService.addLog(testLog);

// Verify mock was called
expect(db.insert).toHaveBeenCalled();
expect((db as any)._mocks.run).toHaveBeenCalledWith(
  expect.objectContaining({ notes: 'Test' })
);
```

### Mock Methods

```typescript
// For SELECT queries
(db as any)._mocks.all.mockResolvedValueOnce([...logs]);

// For INSERT/UPDATE/DELETE queries
(db as any)._mocks.run.mockResolvedValueOnce({ changes: 1 });

// For WHERE clauses
(db as any)._mocks.where.mockReturnValue({
  all: jest.fn().mockResolvedValueOnce([log]),
});

// For INSERT values
(db as any)._mocks.values.mockReturnValue({
  run: jest.fn().mockResolvedValueOnce(undefined),
});

// For UPDATE set
(db as any)._mocks.set.mockReturnValue({
  where: jest.fn().mockReturnValue({
    run: jest.fn().mockResolvedValueOnce(undefined),
  }),
});
```

### Common Test Patterns

```typescript
// Test successful insert
(db as any)._mocks.run.mockResolvedValueOnce({ id: 'new-id' });
const result = await LogService.addLog(testLog);
expect(result.id).toBe('new-id');

// Test error handling
(db as any)._mocks.run.mockRejectedValueOnce(new Error('DB error'));
await expect(LogService.addLog(testLog)).rejects.toThrow('DB error');

// Test select query
const logs = [createMockLog(), createMockLog()];
(db as any)._mocks.all.mockResolvedValueOnce(logs);
const result = await LogService.loadLogs();
expect(result).toHaveLength(2);
```

---

## testDb.ts

Real in-memory SQLite for integration tests.

### createTestDb()

```typescript
import { createTestDb } from '../helpers/testDb';

const { db, sqlite } = createTestDb();
// db: Real Drizzle instance connected to in-memory SQLite
// sqlite: Raw SQLite connection for direct queries

// After tests
sqlite.close();
```

### Using testDb in Integration Tests

```typescript
import { createTestDb } from '../helpers/testDb';
import { cigaretteLogs } from '../../src/db/schema';

describe('Integration', () => {
  let testDb: ReturnType<typeof createTestDb>;

  beforeAll(async () => {
    testDb = createTestDb();
    // Re-mock src/db to use testDb.db
    jest.doMock('../../src/db', () => ({
      db: testDb.db,
      // ...
    }));
  });

  afterAll(() => {
    testDb.sqlite.close();
  });

  it('persists to SQLite', async () => {
    // Service now uses real SQLite
    const result = await LogService.addLog(testLog);

    // Query database directly to verify
    const persisted = testDb.db
      .select()
      .from(cigaretteLogs)
      .all();

    expect(persisted).toHaveLength(1);
  });
});
```

### Querying Test Database

```typescript
// Select all
const allLogs = testDb.db.select().from(cigaretteLogs).all();

// Select with where
import { eq } from 'drizzle-orm';
const log = testDb.db
  .select()
  .from(cigaretteLogs)
  .where(eq(cigaretteLogs.id, 'log-123'))
  .all();

// Count
const count = testDb.db.select().from(cigaretteLogs).all().length;

// Raw SQL via sqlite
const result = testDb.sqlite.prepare(
  'SELECT COUNT(*) as count FROM cigarette_logs'
).all();
```

### Clearing Test Database

```typescript
beforeEach(() => {
  // Clear all tables between tests
  testDb.sqlite.exec('DELETE FROM cigarette_logs');
  testDb.sqlite.exec('DELETE FROM settings');
});
```

---

## testUtils.ts

Shared test utilities for state management and timing.

### resetStores()

```typescript
import { resetStores } from '../helpers/testUtils';

describe('LogService', () => {
  beforeEach(() => {
    resetStores(); // Clear both stores to initial state
  });

  it('test with clean state', () => {
    // Both useLogStore and useSettingsStore are reset
  });
});
```

### setFixedDate(dateString)

```typescript
import { setFixedDate } from '../helpers/testUtils';

describe('Date calculations', () => {
  beforeEach(() => {
    setFixedDate('2025-01-15T12:00:00Z');
  });

  it('uses fixed date', () => {
    const now = new Date();
    expect(now.toISOString()).toContain('2025-01-15');
  });
});
```

### advanceTime(ms)

```typescript
import { advanceTime } from '../helpers/testUtils';

describe('Async operations', () => {
  it('waits for timer', async () => {
    let completed = false;

    setTimeout(() => {
      completed = true;
    }, 5000);

    await advanceTime(5000);

    expect(completed).toBe(true);
  });
});
```

### waitForAsync()

```typescript
import { waitForAsync } from '../helpers/testUtils';

describe('Store updates', () => {
  it('waits for promises', async () => {
    // Trigger async store update
    useLogStore.setState(state => ({
      isLoading: true,
    }));

    // Wait for promise queue to flush
    await waitForAsync();

    // Store is now updated
    expect(useLogStore.getState().isLoading).toBe(false);
  });
});
```

---

## Helper Usage Checklist

### For Unit Tests

```typescript
import { createMockLog, createMockSettings } from '../helpers/mockData';
import { resetStores, setFixedDate } from '../helpers/testUtils';

describe('Unit Test', () => {
  beforeEach(() => {
    resetStores();
    setFixedDate('2025-01-15T12:00:00Z');
  });

  it('does something', () => {
    const log = createMockLog();
    // ...test...
  });
});
```

### For Integration Tests

```typescript
import { createTestDb } from '../helpers/testDb';
import { createMockLog } from '../helpers/mockData';
import { resetStores } from '../helpers/testUtils';

describe('Integration Test', () => {
  let testDb: ReturnType<typeof createTestDb>;

  beforeAll(async () => {
    testDb = createTestDb();
    jest.resetModules();
    jest.doMock('../../src/db', () => ({
      db: testDb.db,
      // ...
    }));
  });

  beforeEach(() => {
    resetStores();
    testDb.sqlite.exec('DELETE FROM cigarette_logs');
  });

  afterAll(() => {
    testDb.sqlite.close();
  });

  it('persists data', async () => {
    const log = createMockLog();
    // ...test with real SQLite...
  });
});
```

### For Screen Tests

```typescript
import { render } from '@testing-library/react-native';
import { createMockLog, createMockSettings } from '../helpers/mockData';
import { resetStores } from '../helpers/testUtils';

describe('Screen Test', () => {
  beforeEach(() => {
    resetStores();
  });

  it('renders with data', () => {
    const log = createMockLog();
    useLogStore.setState({ logs: [log] });

    const { getByText } = render(<HomeScreen />);
    // ...test...
  });
});
```

---

## Adding New Helpers

When adding helpers:

1. **Keep them pure** - No side effects, no implicit state
2. **Document with examples** - Add JSDoc comments
3. **Export clearly** - One function per export or named exports
4. **Update this file** - Add reference section above
5. **Use in tests** - Import explicitly where needed

Example:

```typescript
// __tests__/helpers/myHelper.ts

/**
 * Creates a formatted date string for testing
 * @param days - Number of days in the past (0 = today)
 * @returns ISO date string
 */
export const createDateString = (days: number = 0): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
};
```

---

## Next Steps

- **Unit tests**: See [UNIT_TESTING.md](./UNIT_TESTING.md)
- **Integration tests**: See [INTEGRATION_TESTING.md](./INTEGRATION_TESTING.md)
- **Screen tests**: See [SCREEN_TESTING.md](./SCREEN_TESTING.md)
- **E2E tests**: See [E2E_TESTING.md](./E2E_TESTING.md)
