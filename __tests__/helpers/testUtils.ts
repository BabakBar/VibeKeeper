import { renderHook } from '@testing-library/react-native';
import { useLogStore } from '../../src/stores/logStore';
import { useSettingsStore } from '../../src/stores/settingsStore';

/**
 * Reset all Zustand stores to initial state between tests
 *
 * Call this in beforeEach() to ensure test isolation
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
 * Advance fake timers and flush promise queue
 *
 * Useful for testing async code with fake timers enabled
 */
export const advanceTime = async (ms: number) => {
  jest.advanceTimersByTime(ms);
  await Promise.resolve(); // Flush promise queue
};

/**
 * Set a fixed date for deterministic tests
 *
 * Example: setFixedDate('2025-01-15T12:00:00Z')
 * Used when testing date-dependent calculations
 */
export const setFixedDate = (dateString: string) => {
  jest.setSystemTime(new Date(dateString));
};

/**
 * Helper to render a hook with automatic cleanup
 */
export const renderHookWithCleanup = <T,>(hook: () => T) => {
  const result = renderHook(hook);

  // Cleanup will be called by Jest afterEach automatically
  return result;
};

/**
 * Wait for async operations to complete
 *
 * Useful when testing async store updates
 */
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));
