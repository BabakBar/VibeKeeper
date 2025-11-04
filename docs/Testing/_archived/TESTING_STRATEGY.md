# VibeKeeper - Comprehensive Testing Strategy

**Version**: 1.0
**Last Updated**: 2025-11-04
**Coverage Goal**: >80% for all critical paths

---

## Key Decisions

### Questions Answered

**Q: What tooling for device-level flows?**
- **A: Detox** - Chosen for Expo compatibility, deterministic behavior, and CI-friendly setup. Detox integrates well with Expo via `detox-expo-helpers`, supports both iOS/Android, and has proven GitHub Actions support.

**Q: SQLite testing approach - in-memory DB or pure mocking?**
- **A: Hybrid approach**:
  - **Unit tests**: Pure mocks (fast, isolated)
  - **Integration tests**: In-memory SQLite with `better-sqlite3` (catches SQL errors, schema issues)
  - **E2E tests**: Real Expo SQLite on device (validates full stack)
  - **Rationale**: Balances speed (unit), correctness (integration), and reality (E2E)

### Critical Fixes Applied

1. ✅ **Jest preset**: Changed from `react-native` to `jest-expo` for Expo SDK 54 compatibility
2. ✅ **Coverage threshold**: Fixed typo `coverageThresholds` → `coverageThreshold` (enforces 80%+ coverage)
3. ✅ **Drizzle mocks**: Implemented proper chained builder pattern (`.select().from().where().all()`)
4. ✅ **E2E in Phase 1**: Mobile flows NOT deferred - 3 critical Detox tests required before release
5. ✅ **Fake timers**: Fixed invalid `timers: 'modern'` → valid `fakeTimers: { enableGlobally: true }`
6. ✅ **Transform patterns**: Added Drizzle, Zustand, and all Expo packages to transform list
7. ✅ **Mock strategy**: Mock `src/db` directly instead of trying to mock expo-sqlite + drizzle chain
8. ✅ **Expo SQLite mock**: Properly structured to match real `openDatabaseSync()` API

#### Blocker Resolution (2025-11-04)

Three remaining test infrastructure issues were identified and resolved:

**Blocker #1 – Global db mock prevents integration testing** (RESOLVED)
- **Issue**: `jest.setup.js` mocks `src/db` globally, preventing integration tests from exercising the real SQLite path
- **Solution**: Documented "Unit vs Integration Mocking Pattern" (see Test Setup section) showing how to `jest.unmock()` per test suite
- **Impact**: Integration tests can now use real `better-sqlite3` by unblocking the global mock at test start

**Blocker #2 – Missing module exports in db mock** (RESOLVED)
- **Issue**: `src/app/_layout.tsx` imports `initializeDatabase` and `resetDatabase` (line 4), but the jest mock only exported `db`, causing `TypeError: initializeDatabase is not a function`
- **Solution**: Added `initializeDatabase` and `resetDatabase` re-exports as no-op async stubs in the jest.mock (lines 482-483)
- **Impact**: Layout tests no longer crash when rendering the root component

**Blocker #3 – Missing async methods in Expo SQLite stub** (RESOLVED)
- **Issue**: Production code (`src/db/index.ts:44-88`) calls `database.execAsync()` and other async methods, but the jest mock only provided sync methods (execSync, runSync, etc.)
- **Solution**: Added async counterparts (`execAsync`, `runAsync`, `getAllAsync`, etc.) that return resolved promises (lines 430-437)
- **Impact**: Tests that touch database initialization paths no longer crash with "execAsync is not a function"

---

## Verification Summary

All critical issues identified by code review have been addressed:

### ✅ Issue 1: Invalid `timers: 'modern'` Config Key
**Problem**: `timers: 'modern'` is not a supported Jest config key
**Fix**: Changed to `fakeTimers: { enableGlobally: true }`
**Verification**: Confirmed via [Jest docs](https://jestjs.io/docs/configuration#faketimers-object) that `fakeTimers` object is correct

### ✅ Issue 2: Undefined `mockDb` Reference
**Problem**: `jest.setup.js` referenced `mockDb` without defining it
**Fix**:
- Defined `mockDb` inline with proper `openDatabaseSync()` structure
- Added `createMockDrizzle()` import for `src/db` mock
**Verification**: Mock now matches Expo SQLite API structure

### ✅ Issue 3: Incorrect Expo SQLite Mock Structure
**Problem**: Mocking `expo-sqlite` to return Drizzle directly doesn't match real API
**Fix**:
- Mock `expo-sqlite`'s `openDatabaseSync()` to return a DB object (not Drizzle)
- Mock `src/db` module directly to return `createMockDrizzle()` output
- This avoids the fragile chain of mocking expo-sqlite → drizzle-orm
**Verification**: Aligns with [Drizzle team's recommendation](https://github.com/drizzle-team/drizzle-orm/discussions/784) to mock at the service layer, not the driver

### Sources Consulted
- Jest Documentation: Timer Mocks, Configuration
- Expo Documentation: Unit Testing with Jest
- Drizzle ORM GitHub: Discussions on testing strategies
- Stack Overflow: Multiple threads on expo-sqlite mocking
- npm: `expo-sqlite-mock`, `jest-expo` package docs

---

## Testing Overview

### Current State
- **Dependencies Installed**: Jest, @testing-library/react-native, React Test Renderer
- **Dependencies Needed**:
  - `jest-expo` - Expo-specific Jest preset
  - `better-sqlite3` - In-memory SQLite for integration tests
  - `drizzle-orm/better-sqlite3` - Drizzle adapter for Node.js SQLite
  - `expo-sqlite-mock` - Mock Expo SQLite for unit tests
  - `detox` + `detox-expo-helpers` - E2E testing
- **Tests Implemented**: None (starting from scratch)
- **Target Coverage**: 80%+ for critical paths
- **E2E Framework**: Detox (chosen for Expo compatibility, deterministic, CI-friendly)

### Testing Layers

```
┌─────────────────────────────────────┐
│   E2E Tests (Detox)                 │  Critical user flows on device (Phase 1)
├─────────────────────────────────────┤
│   Integration Tests                 │  Service + Store + DB interactions (Phase 1)
├─────────────────────────────────────┤
│   Screen Tests (RTL)                │  Navigation, rendering, user interactions (Phase 1)
├─────────────────────────────────────┤
│   Unit Tests                        │  Pure functions, stores, services (Phase 1)
└─────────────────────────────────────┘
```

---

## Testing Approach

### SQLite Testing Strategy
**Decision**: Mock `src/db` for unit tests, in-memory SQLite for integration tests

**Rationale**:
- **Unit tests**: Mock the `db` export from `src/db` using `createMockDrizzle()` helper
  - Fast, isolated, no real DB needed
  - Avoids complexity of mocking both expo-sqlite AND drizzle-orm
- **Integration tests**: Use `better-sqlite3` in-memory with Drizzle
  - Catches SQL errors, schema issues, type mismatches
  - Runs in Node.js (Jest environment)
- **E2E tests**: Real Expo SQLite on device
  - Validates full stack including platform-specific SQLite

**Why mock `src/db` directly?**
- Expo SQLite uses `openDatabaseSync()` which returns a native DB object
- Drizzle wraps that with `drizzle(expoDb)`
- Mocking both layers is fragile and doesn't match the real API
- Mocking the final `db` export is simpler and more reliable

### Fake Timers Strategy

**Enabled Globally** via `jest.config.js`:
```javascript
fakeTimers: {
  enableGlobally: true,
}
```

**Set specific dates in tests**:
```typescript
beforeEach(() => {
  jest.setSystemTime(new Date('2025-01-15T12:00:00Z')); // Fixed reference point
});

afterEach(() => {
  jest.clearAllTimers();
});
```

**Override in specific tests if needed**:
```typescript
it('should work with real timers', () => {
  jest.useRealTimers();
  // test code that needs real Date/setTimeout
  jest.useFakeTimers(); // Re-enable for next test
});
```

**Why**: Statistics and date utilities rely on `Date.now()`, `new Date()` - deterministic times prevent flaky tests. Modern fake timers are default in Jest 27+ and work correctly with Promises.

---

## Phase 1: Core Testing (All Must Complete Before Release)

### 1.1 Date Utilities (`src/utils/dateUtils.ts`)

**Coverage Goal**: 100%

**Test Cases**:
- `formatDate()` - various date inputs, edge cases
- `formatTime()` - various timestamps, midnight, noon
- `formatDateTime()` - combined date/time formatting
- `getStartOfDay()` / `getEndOfDay()` - boundary times
- `getStartOfWeek()` / `getEndOfWeek()` - week boundaries, Sunday start
- `getStartOfMonth()` / `getEndOfMonth()` - month boundaries, leap years
- `isToday()` - today, yesterday, tomorrow
- `daysBetween()` - same day, different days, negative ranges
- `getRelativeTime()` - just now, minutes, hours, days, weeks

**Why Priority 1**: Pure functions, no dependencies, foundation for statistics

---

### 1.2 Zustand Stores

#### LogStore (`src/stores/logStore.ts`)

**Coverage Goal**: 100%

**Test Cases**:
- Initial state (empty logs, no loading, no error)
- `setLogs()` - replaces all logs
- `addLog()` - adds single log, maintains immutability
- `removeLog()` - removes by id, handles non-existent id
- `updateLog()` - updates specific fields, auto-updates timestamp
- `setLoading()` / `setError()` - state updates
- `clearLogs()` - resets to empty
- `getLogsByDate()` - filters by YYYY-MM-DD, handles no matches
- `getLogsInRange()` - filters by timestamp range, edge cases

**Why Priority 1**: Core state management, used by all services

#### SettingsStore (`src/stores/settingsStore.ts`)

**Coverage Goal**: 100%

**Test Cases**:
- Initial state (null settings, no loading, no error)
- `setSettings()` - sets settings object
- `updateSettings()` - partial updates, handles null settings
- `setLoading()` / `setError()` - state updates
- `getCostPerCigarette()` - returns value or default (0.5)
- `getCurrencySymbol()` - returns value or default ($)
- `getDailyGoal()` - returns value or undefined
- `isNotificationsEnabled()` - returns value or default (true)

**Why Priority 1**: Settings accessed by statistics calculations

---

### 1.3 Services (with Mocked Database)

#### LogService (`src/services/logService.ts`)

**Coverage Goal**: 90%+ (excluding platform-specific DB issues)

**Mocking Strategy**:
- Mock `db` operations (insert, select, update, delete)
- Mock `useLogStore` setState and getState
- Isolate each method

**Test Cases**:
- `loadLogs()` - success, empty result, error handling, state updates
- `addLog()` - success with defaults, custom timestamp/notes, ID generation, state updates
- `updateLog()` - success, partial updates, non-existent log, error handling
- `deleteLog()` - success, non-existent log, error handling, state cleanup
- `quickLog()` - delegates to addLog with current timestamp
- `getLogsByDate()` - delegates to store method
- `getLogsInRange()` - delegates to store method
- `getCountByDate()` - returns correct count

**Why Priority 1**: Core CRUD, most-used feature

#### SettingsService (`src/services/settingsService.ts`)

**Coverage Goal**: 90%+

**Mocking Strategy**:
- Mock `db` operations
- Mock `useSettingsStore` setState and getState

**Test Cases**:
- `loadSettings()` - existing settings, create default on first load, error handling
- `createDefaultSettings()` - creates with correct defaults
- `updateSettings()` - partial updates, all fields, error handling
- `updateSetting()` - single field update, error when not loaded
- `resetSettings()` - restores defaults, reloads

**Why Priority 1**: Settings used by statistics calculations

#### StatisticsService (`src/services/statisticsService.ts`)

**Coverage Goal**: 95%+

**Mocking Strategy**:
- Mock `useLogStore.getState()` with test data
- Mock `useSettingsStore.getState()` with test settings
- Focus on calculation logic

**Test Cases**:
- `getDailyStats()` - zero logs, single log, multiple logs, cost calculation
- `getTodayStats()` - uses current date
- `getWeeklyStats()` - full week, partial week, week spanning months, daily breakdown
- `getMonthlyStats()` - full month, current month, 28/29/30/31 day months, weekly breakdown
- `getStatsForPastDays()` - 7 days, 30 days, handles missing days
- `getSummaryStats()` - zero logs, single log, multiple days, date range calculation
- `getStreak()` - zero logs, single day, consecutive days, broken streak

**Why Priority 1**: Complex calculations, critical for user insights

---

## Phase 2: Integration Tests

### 2.1 Service + Store Integration

**Coverage Goal**: Key user flows at 90%+

**Test Cases**:
1. **Complete Log Flow**:
   - Load logs → Add log → Verify in store → Delete log → Verify removed

2. **Settings Flow**:
   - Load settings → Update cost → Statistics reflect new cost

3. **Statistics with Real Data**:
   - Add multiple logs → Calculate daily/weekly/monthly → Verify accuracy

**Why Phase 1**: Validates interaction between layers, catches integration bugs

---

### 2.2 Screen Tests (React Native Testing Library)

**Coverage Goal**: Critical screens at 75%+

**Mocking Strategy**:
- Mock Expo Router navigation
- Mock database initialization
- Real stores (Zustand) with test data
- Mock platform-specific modules

**Test Cases**:

**Home Screen** (`src/app/index.tsx`):
- Renders today's stats correctly
- Quick add button calls LogService.quickLog()
- Shows recent logs list
- Navigation to logs/settings works

**Logs Screen** (`src/app/logs.tsx`):
- Displays logs for selected date
- Date navigation (prev/next) updates view
- Delete button removes log
- Empty state shown when no logs

**Settings Screen** (`src/app/settings.tsx`):
- Displays current settings
- Input changes update local state
- Save button calls SettingsService.updateSettings()
- Reset button shows confirmation, restores defaults

**Why Phase 1**: Expo Router navigation, screen rendering, and user interactions are core to mobile UX - must validate before release

---

### 2.3 E2E Tests (Detox)

**Coverage Goal**: 3 critical user flows

**Setup**:
```bash
npm install --save-dev detox detox-expo-helpers
npx detox init
```

**Config**: `.detoxrc.js` for iOS Simulator + Android Emulator

**Test Cases**:

1. **Quick Log Flow** (30 seconds):
   - Launch app → Tap quick add → See count increment → Success

2. **Full Log Management** (1 minute):
   - Navigate to logs → Add log with notes → Edit log → Delete log → Verify removed

3. **Settings Persistence** (45 seconds):
   - Change cost per cigarette → Kill app → Relaunch → Verify setting persisted

**Why Phase 1**: Validates offline SQLite persistence, Expo Router navigation, and critical mobile flows that unit tests can't catch

**Tooling Choice: Detox**
- ✅ Works with Expo via `detox-expo-helpers`
- ✅ Deterministic (gray-box testing)
- ✅ CI-friendly (GitHub Actions support)
- ✅ Active maintenance
- ❌ Maestro considered but less mature for Expo
- ❌ Playwright doesn't support native mobile

---

## Test Infrastructure

### Jest Configuration

**File**: `jest.config.js`

```javascript
module.exports = {
  preset: 'jest-expo', // Use jest-expo for Expo SDK 54 compatibility
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    // Transform Expo, React Native, Drizzle, and related packages
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|drizzle-orm|zustand)/)',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  testMatch: [
    '**/__tests__/**/*.(test|spec).[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/e2e/', // Detox tests run separately
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/db/index.ts', // Platform-specific DB init tested via E2E
  ],
  coverageThreshold: { // SINGULAR, not "Thresholds"
    global: {
      statements: 80,
      branches: 75,
      functions: 80,
      lines: 80,
    },
  },
  // Enable fake timers globally for deterministic date tests
  fakeTimers: {
    enableGlobally: true,
  },
};
```

### Test Setup

**File**: `jest.setup.js`

```javascript
import '@testing-library/react-native/extend-expect';

// ============================================================================
// BLOCKER FIX #1 & #3: Expo SQLite Mock with Async Methods
// ============================================================================
// Mock Expo SQLite with BOTH sync AND async methods.
// Production code (src/db/index.ts:44-88) uses execAsync/runAsync, so the mock
// must provide async counterparts. This prevents crashes when tests touch those paths.
jest.mock('expo-sqlite', () => {
  const mockDb = {
    // Sync methods (for compatibility)
    execSync: jest.fn(),
    getAllSync: jest.fn(() => []),
    getFirstSync: jest.fn(() => null),
    runSync: jest.fn(),
    prepareSync: jest.fn(() => ({
      executeSync: jest.fn(),
      finalizeSync: jest.fn(),
    })),
    // Async methods (REQUIRED for initializeDatabase/resetDatabase)
    execAsync: jest.fn(() => Promise.resolve(undefined)),
    runAsync: jest.fn(() => Promise.resolve({ lastInsertRowid: 0, changes: 0 })),
    getAllAsync: jest.fn(() => Promise.resolve([])),
    getFirstAsync: jest.fn(() => Promise.resolve(null)),
    prepareAsync: jest.fn(() => Promise.resolve({
      executeAsync: jest.fn(() => Promise.resolve(undefined)),
      finalizeAsync: jest.fn(() => Promise.resolve(undefined)),
    })),
  };

  return {
    openDatabaseSync: jest.fn(() => mockDb),
  };
});

// Mock React Native Alert
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

// Mock Expo Router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
  Stack: ({ children }) => children,
  Link: ({ children }) => children,
}));

// ============================================================================
// BLOCKER FIX #2: src/db Module Mock with Complete Exports
// ============================================================================
// The _layout.tsx component imports initializeDatabase and resetDatabase (line 4).
// The mock MUST re-export these functions (even as no-ops) to preserve module shape.
// Otherwise, tests that render the layout will crash with:
//   "TypeError: initializeDatabase is not a function"
//
// For unit tests: mocked db + no-op stubs are fine
// For integration tests: See "Unit vs Integration Mocking" pattern below
jest.mock('./src/db', () => {
  const mockDrizzle = require('./__tests__/helpers/mockDrizzle').createMockDrizzle();

  return {
    // Mock database instance for unit tests
    db: mockDrizzle,
    default: mockDrizzle,

    // Re-export database functions as no-op stubs for unit tests
    // Integration tests will unmock this module to use real Drizzle + better-sqlite3
    initializeDatabase: jest.fn(() => Promise.resolve(true)),
    resetDatabase: jest.fn(() => Promise.resolve(true)),
  };
});

// Fake timers are enabled globally via jest.config.js fakeTimers config
// Individual tests can override with jest.useRealTimers() if needed
```

---

#### Unit vs Integration Mocking Pattern

**Unit Tests** (use global mocks from jest.setup.js):
- Keep the `jest.mock('./src/db')` active
- Services see mocked database, fast and isolated
- No SQLite needed
- Example: `__tests__/unit/services/logService.test.ts`

```typescript
// No special setup needed - jest.setup.js mocks apply automatically
describe('LogService', () => {
  it('adds log successfully', async () => {
    // db is mocked globally, test runs fast and isolated
    const result = await LogService.addLog(testLog);
    expect(result.id).toBeDefined();
  });
});
```

**Integration Tests** (unmock src/db to use real SQLite):
- Unmock `src/db` BEFORE importing services (critical order)
- Create real in-memory SQLite via `better-sqlite3`
- Services see real Drizzle instance, exercises SQL
- Keep `expo-sqlite` mock active (real native module fails in Node)
- Re-import services AFTER mock swap to bind new db instance
- Example: `__tests__/integration/logFlow.test.ts`

```typescript
// IMPORTANT: Unmock BEFORE importing services
// This ensures services get the real db instance, not the mocked one
jest.unmock('../../src/db'); // Use correct relative path!
// Keep expo-sqlite mocked - real native module won't load in Node

import { createTestDb } from '../helpers/testDb';

describe('LogService Integration', () => {
  let testDb: ReturnType<typeof createTestDb>;
  let LogService: any; // Type will be reassigned after mock swap

  beforeAll(async () => {
    // Create in-memory SQLite
    testDb = createTestDb();

    // Clear module cache and re-mock src/db with real SQLite
    jest.resetModules();
    jest.doMock('../../src/db', () => ({
      db: testDb.db,
      default: testDb.db,
      initializeDatabase: jest.fn(() => Promise.resolve(true)),
      resetDatabase: jest.fn(() => Promise.resolve(true)),
    }));

    // NOW import/require the service - it will see the new db binding
    // Using dynamic import ensures the mock is active when service loads
    const logServiceModule = await import('../../src/services/logService');
    LogService = logServiceModule.LogService;
  });

  afterAll(() => {
    testDb.sqlite.close();
  });

  it('persists log to SQLite', async () => {
    const testLog = { notes: 'test', timestamp: Date.now() };

    // db now uses real Drizzle + better-sqlite3
    const result = await LogService.addLog(testLog);

    // Verify it was actually inserted into SQLite
    // (not just passed to a mock, but persisted in the real table)
    expect(result.id).toBeDefined();

    // Query directly from test DB to confirm persistence
    const persisted = testDb.db.select()
      .from(cigaretteLogs)
      .where(eq(cigaretteLogs.id, result.id))
      .all();
    expect(persisted).toHaveLength(1);
    expect(persisted[0].notes).toBe('test');
  });
});
```

**Critical Order for Integration Tests**:
1. `jest.unmock('../../src/db')` - Before any imports
2. `jest.resetModules()` - Clear the module cache
3. `jest.doMock()` - Set up new mock with real SQLite
4. `await import()` - Re-import services to bind new db instance
5. Run tests with services using real SQLite

### Test File Structure

```
__tests__/
├── unit/
│   ├── utils/
│   │   └── dateUtils.test.ts
│   ├── stores/
│   │   ├── logStore.test.ts
│   │   └── settingsStore.test.ts
│   └── services/
│       ├── logService.test.ts
│       ├── settingsService.test.ts
│       └── statisticsService.test.ts
├── integration/
│   ├── logFlow.test.ts
│   ├── settingsFlow.test.ts
│   └── statisticsFlow.test.ts
├── screens/
│   ├── index.test.tsx (home screen)
│   ├── logs.test.tsx
│   └── settings.test.tsx
├── e2e/
│   ├── quickLog.e2e.ts
│   ├── logManagement.e2e.ts
│   └── settingsPersistence.e2e.ts
└── helpers/
    ├── mockData.ts
    ├── mockDrizzle.ts (proper chained mocks)
    ├── testDb.ts (in-memory SQLite for integration)
    └── testUtils.ts
```

---

## Test Utilities & Helpers

### Mock Data Factory

**File**: `__tests__/helpers/mockData.ts`

```typescript
export const createMockLog = (overrides?: Partial<CigaretteLog>): CigaretteLog
export const createMockSettings = (overrides?: Partial<Settings>): Settings
export const createMockLogs = (count: number): CigaretteLog[]
```

### Mock Drizzle Database (Chained Builders)

**File**: `__tests__/helpers/mockDrizzle.ts`

```typescript
/**
 * Drizzle uses chained builder pattern:
 * db.select().from(table).where(...).all()
 * db.insert(table).values(...).run()
 *
 * Must return chainable mocks for each method.
 */

export const createMockDrizzle = () => {
  const mockAll = jest.fn().mockResolvedValue([]);
  const mockRun = jest.fn().mockResolvedValue(undefined);

  const mockWhere = jest.fn().mockReturnValue({
    all: mockAll,
    run: mockRun,
  });

  const mockFrom = jest.fn().mockReturnValue({
    where: mockWhere,
    all: mockAll,
    orderBy: jest.fn().mockReturnValue({
      all: mockAll,
    }),
  });

  const mockValues = jest.fn().mockReturnValue({
    run: mockRun,
  });

  const mockSet = jest.fn().mockReturnValue({
    where: mockWhere,
  });

  const mockDb = {
    select: jest.fn().mockReturnValue({
      from: mockFrom,
    }),
    insert: jest.fn().mockReturnValue({
      values: mockValues,
    }),
    update: jest.fn().mockReturnValue({
      set: mockSet,
    }),
    delete: jest.fn().mockReturnValue({
      where: mockWhere,
    }),
    // Expose inner mocks for assertions
    _mocks: {
      all: mockAll,
      run: mockRun,
      where: mockWhere,
      from: mockFrom,
      values: mockValues,
      set: mockSet,
    },
  };

  return mockDb;
};

// Usage in tests:
// Import is already mocked in jest.setup.js
// Just configure mock return values in individual tests:
//
// import { db } from '../db';
// (db as any)._mocks.all.mockResolvedValueOnce([...logs]);
```

### In-Memory SQLite for Integration Tests

**File**: `__tests__/helpers/testDb.ts`

```typescript
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { cigaretteLogs, settings } from '../../src/db/schema';

/**
 * Creates real in-memory SQLite for integration tests.
 * Catches SQL errors, schema issues, and type mismatches.
 */
export const createTestDb = () => {
  const sqlite = new Database(':memory:');
  const db = drizzle(sqlite);

  // Create tables
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

  return { db, sqlite };
};

// Usage:
// const { db, sqlite } = createTestDb();
// ... run tests
// sqlite.close();
```

### Test Utilities

**File**: `__tests__/helpers/testUtils.ts`

```typescript
import { renderHook } from '@testing-library/react-native';
import { useLogStore } from '../../src/stores/logStore';
import { useSettingsStore } from '../../src/stores/settingsStore';

/**
 * Reset all stores to initial state between tests
 */
export const resetStores = () => {
  useLogStore.setState({
    logs: [],
    isLoading: false,
    error: null,
  });

  useSettingsStore.setState({
    settings: null,
    isLoading: false,
    error: null,
  });
};

/**
 * Advance fake timers and flush promises
 */
export const advanceTime = async (ms: number) => {
  jest.advanceTimersByTime(ms);
  await Promise.resolve(); // Flush promise queue
};

/**
 * Set a fixed date for deterministic tests
 */
export const setFixedDate = (dateString: string) => {
  jest.setSystemTime(new Date(dateString));
};

/**
 * Render hook with cleanup
 */
export const renderHookWithCleanup = <T,>(hook: () => T) => {
  const result = renderHook(hook);
  afterEach(() => {
    result.unmount();
  });
  return result;
};
```

---

## Running Tests

### Commands

```bash
# Run all unit + integration + screen tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- dateUtils.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="formatDate"

# Run E2E tests (Detox)
npm run test:e2e:ios
npm run test:e2e:android

# Build E2E app
npm run build:e2e:ios
npm run build:e2e:android
```

**Add to package.json**:
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "build:e2e:ios": "detox build --configuration ios.sim.debug",
    "test:e2e:ios": "detox test --configuration ios.sim.debug",
    "build:e2e:android": "detox build --configuration android.emu.debug",
    "test:e2e:android": "detox test --configuration android.emu.debug"
  },
  "devDependencies": {
    "@testing-library/react-native": "^12.4.0",
    "jest": "^29.7.0",
    "jest-expo": "^51.0.0",
    "react-test-renderer": "19.1.0",
    "better-sqlite3": "^9.2.0",
    "detox": "^20.14.0",
    "detox-expo-helpers": "^0.6.0"
  }
}
```

### Coverage Reports

- Console output after each run
- HTML report: `coverage/lcov-report/index.html`
- Target: 80%+ for critical paths

---

## Test-Driven Development Workflow

1. **Write failing test** - Define expected behavior
2. **Run test** - Confirm it fails
3. **Write minimal code** - Make test pass
4. **Refactor** - Improve code quality
5. **Repeat** - Next test case

---

## Coverage Priorities

### P0 (Must Have) - 90%+ Coverage
- `dateUtils.ts` - Pure functions
- `logStore.ts` - Core state
- `settingsStore.ts` - Settings state
- `statisticsService.ts` - Calculations

### P1 (High Priority) - 85%+ Coverage
- `logService.ts` - CRUD operations
- `settingsService.ts` - Settings management

### P2 (Medium Priority) - 75%+ Coverage
- Integration tests for key flows

### P2 (Medium Priority) - 75%+ Coverage
- Screen components (home, logs, settings)
- E2E critical flows (3 tests minimum)

### P3 (Nice to Have) - 60%+ Coverage
- Additional edge cases
- Performance benchmarks
- Accessibility compliance tests

---

## Continuous Integration

### Pre-commit Checks (Future)
```bash
npm test -- --coverage --watchAll=false
```

### CI/CD Pipeline (Future)
- Run tests on every push
- Block merge if coverage drops below 80%
- Generate coverage badges

---

## Best Practices

### Test Naming
```typescript
describe('DateUtils', () => {
  describe('formatDate', () => {
    it('formats date as YYYY-MM-DD', () => {})
    it('handles single-digit months with leading zero', () => {})
    it('handles single-digit days with leading zero', () => {})
  })
})
```

### Test Structure (AAA Pattern)
```typescript
it('adds log successfully', async () => {
  // Arrange - Set up test data and mocks
  const mockLog = createMockLog();

  // Act - Execute the function
  const result = await LogService.addLog(mockLog);

  // Assert - Verify the outcome
  expect(result.id).toBeDefined();
  expect(mockDb.insert).toHaveBeenCalledTimes(1);
})
```

### Mocking Guidelines
- Mock external dependencies (DB, stores)
- Don't mock the code under test
- Use factory functions for consistent test data
- Reset mocks between tests

### Coverage ≠ Quality
- 100% coverage doesn't guarantee bug-free code
- Focus on testing behavior, not implementation
- Test edge cases and error paths
- Write readable, maintainable tests

---

## Success Criteria

### Phase 1 Complete When:
- [ ] All unit tests written and passing (utils, stores, services)
- [ ] Integration tests with in-memory SQLite passing
- [ ] Screen tests (RTL) for home/logs/settings passing
- [ ] 3 E2E tests (Detox) passing on iOS + Android
- [ ] Coverage >80% overall (enforced by Jest threshold)
- [ ] Zero console errors/warnings in test output
- [ ] All tests run in <2 minutes (unit+integration+screen)
- [ ] E2E tests run in <5 minutes per platform
- [ ] CI pipeline configured (GitHub Actions)
- [ ] Documentation updated

---

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Next Steps**: Implement test infrastructure and begin with `dateUtils.test.ts`
