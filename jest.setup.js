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
// For integration tests: See "Unit vs Integration Mocking" pattern in TESTING_STRATEGY.md
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
