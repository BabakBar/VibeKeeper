import { CigaretteLog, Settings } from '../../src/types';

/**
 * Creates a mock cigarette log for testing
 */
export const createMockLog = (overrides?: Partial<CigaretteLog>): CigaretteLog => {
  const now = Date.now();
  return {
    id: `log-${Math.random().toString(36).slice(2)}`,
    timestamp: now,
    notes: 'Test log',
    time: new Date(now).toISOString(),
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
};

/**
 * Creates a mock settings object for testing
 */
export const createMockSettings = (overrides?: Partial<Settings>): Settings => {
  const now = Date.now();
  return {
    id: 'settings-1',
    costPerCigarette: 0.5,
    currencySymbol: '$',
    dailyGoal: 10,
    notificationsEnabled: true,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
};

/**
 * Creates multiple mock logs for testing
 */
export const createMockLogs = (count: number, overrides?: Partial<CigaretteLog>): CigaretteLog[] => {
  const logs: CigaretteLog[] = [];
  for (let i = 0; i < count; i++) {
    logs.push(
      createMockLog({
        timestamp: Date.now() - i * 60000, // Each log 1 minute apart
        notes: `Log ${i + 1}`,
        ...overrides,
      })
    );
  }
  return logs;
};
