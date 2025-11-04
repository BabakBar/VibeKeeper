# Unit Testing Guide

**Target**: Pure logic (utilities, stores, services with mocked database)
**Coverage Goal**: ≥90% on P0 files
**Speed**: <100ms per test
**Database**: Mocked via jest.setup.js

---

## What to Test

### P0 Files (90%+ required)
- `src/utils/dateUtils.ts` - All date formatting and calculations
- `src/stores/logStore.ts` - All store mutations and selectors
- `src/stores/settingsStore.ts` - All settings mutations and selectors
- `src/services/statisticsService.ts` - All calculation logic

### P1 Files (85%+ required)
- `src/services/logService.ts` - CRUD operations with mocked db
- `src/services/settingsService.ts` - Settings management with mocked db

---

## Test File Structure

```typescript
// __tests__/unit/utils/dateUtils.test.ts
import { formatDate, getRelativeTime } from '../../../src/utils/dateUtils';

describe('DateUtils', () => {
  describe('formatDate', () => {
    it('formats date as YYYY-MM-DD', () => {
      const date = new Date('2025-01-15');
      expect(formatDate(date)).toBe('2025-01-15');
    });
  });
});
```

---

## Using Mocked Database

The database is **globally mocked** in jest.setup.js. Services see a mock Drizzle instance:

```typescript
// __tests__/unit/services/logService.test.ts
import { db } from '../../../src/db';
import { LogService } from '../../../src/services/logService';
import { createMockLog } from '../helpers/mockData';

describe('LogService', () => {
  beforeEach(() => {
    // Reset store state
    resetStores();
    jest.clearAllMocks();
  });

  it('adds log successfully', async () => {
    const testLog = createMockLog({ notes: 'Test' });

    // Configure mock to return a result
    (db as any)._mocks.run.mockResolvedValueOnce({ id: 'log-123' });

    const result = await LogService.addLog(testLog);

    expect(result.id).toBe('log-123');
    expect(db.insert).toHaveBeenCalled();
  });

  it('handles database errors gracefully', async () => {
    (db as any)._mocks.run.mockRejectedValueOnce(new Error('DB error'));

    await expect(LogService.addLog(createMockLog())).rejects.toThrow('DB error');
  });
});
```

---

## Accessing Mock Internals

The mock Drizzle instance exposes `_mocks` for configuration:

```typescript
(db as any)._mocks.all       // For select queries
(db as any)._mocks.run       // For insert/update/delete
(db as any)._mocks.where     // For where clauses
(db as any)._mocks.values    // For insert values
```

---

## Testing Zustand Stores

```typescript
// __tests__/unit/stores/logStore.test.ts
import { useLogStore } from '../../../src/stores/logStore';
import { createMockLog } from '../helpers/mockData';

describe('LogStore', () => {
  beforeEach(() => {
    resetStores(); // Reset to initial state
  });

  it('adds log to store', () => {
    const log = createMockLog();
    useLogStore.setState(state => ({
      logs: [...state.logs, log]
    }));

    expect(useLogStore.getState().logs).toContainEqual(log);
  });

  it('removes log from store', () => {
    const log = createMockLog({ id: 'log-1' });
    useLogStore.setState({ logs: [log] });

    useLogStore.setState(state => ({
      logs: state.logs.filter(l => l.id !== 'log-1')
    }));

    expect(useLogStore.getState().logs).toHaveLength(0);
  });
});
```

---

## Fake Timers for Date Tests

Fake timers are enabled globally. Set a fixed date for deterministic tests:

```typescript
// __tests__/unit/services/statisticsService.test.ts
describe('StatisticsService', () => {
  beforeEach(() => {
    // Set fixed date
    jest.setSystemTime(new Date('2025-01-15T12:00:00Z'));
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  it('calculates daily stats for today', () => {
    const stats = StatisticsService.getTodayStats();
    expect(stats.date).toBe('2025-01-15');
  });
});
```

---

## Test Naming Conventions

```typescript
describe('Unit', () => {
  // ✓ Good: Describes the unit and specific behavior
  it('formatDate returns YYYY-MM-DD when given a valid date', () => {});

  // ✓ Good: Describes error behavior
  it('throws error when date is invalid', () => {});

  // ✗ Bad: Too vague
  it('works correctly', () => {});

  // ✗ Bad: Implementation detail
  it('calls Date.toISOString internally', () => {});
});
```

---

## Running Unit Tests

```bash
# Run all unit tests
npm test

# Run specific file
npm test -- dateUtils.test.ts

# Run in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

---

## Common Patterns

### Testing pure functions
```typescript
it('adds two numbers', () => {
  expect(add(2, 3)).toBe(5);
});
```

### Testing store mutations
```typescript
it('updates state immutably', () => {
  const initial = useLogStore.getState();
  useLogStore.setState({ logs: [...initial.logs, newLog] });
  const updated = useLogStore.getState();

  expect(initial.logs).not.toBe(updated.logs); // Different reference
  expect(updated.logs).toHaveLength(1);
});
```

### Testing service methods with mocked db
```typescript
it('persists data via db.insert', async () => {
  (db as any)._mocks.run.mockResolvedValueOnce({ changes: 1 });

  await LogService.addLog(testLog);

  expect(db.insert).toHaveBeenCalled();
  expect((db as any)._mocks.run).toHaveBeenCalled();
});
```

---

## Coverage Requirements

**P0 (90%+)**:
- dateUtils.ts
- logStore.ts, settingsStore.ts
- statisticsService.ts

**P1 (85%+)**:
- logService.ts
- settingsService.ts

Check coverage:
```bash
npm run test:coverage
# Open coverage/lcov-report/index.html
```

---

## Next Steps

→ See **[INTEGRATION_TESTING.md](./INTEGRATION_TESTING.md)** for testing service + SQLite interactions with real database
