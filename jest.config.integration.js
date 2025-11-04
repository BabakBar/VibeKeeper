/**
 * Jest configuration for integration tests
 *
 * Runs tests from __tests__/integration with proper support for:
 * - jest.unmock() and jest.doMock() patterns
 * - Dynamic imports (await import()) for post-mock module loading
 * - Real database operations with SQLite
 *
 * Usage: npm run test:integration:services
 */

module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'node',
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|drizzle-orm|zustand)/)',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  testMatch: [
    '**/__tests__/integration/**/*.(test|spec).[jt]s?(x)',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
  ],
  collectCoverageFrom: [
    'src/services/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
  ],
  // Enable fake timers globally for deterministic date tests
  fakeTimers: {
    enableGlobally: true,
  },
  // Ensure tests run sequentially to avoid module collision
  maxWorkers: 1,
};
