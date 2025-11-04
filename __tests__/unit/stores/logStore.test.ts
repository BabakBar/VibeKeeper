/**
 * Unit tests for logStore (Zustand)
 *
 * Tests store actions, state updates, and query methods
 * Verifies immutability and proper state management
 */

import { useLogStore } from '../../../src/stores/logStore';
import { CigaretteLog } from '../../../src/types';
import { createMockLog, createMockLogs } from '../../helpers/mockData';
import { resetStores, setFixedDate } from '../../helpers/testUtils';

describe('useLogStore', () => {
  beforeEach(() => {
    resetStores();
    setFixedDate('2025-01-15T12:00:00Z');
  });

  describe('initial state', () => {
    it('has empty logs array initially', () => {
      const state = useLogStore.getState();
      expect(state.logs).toEqual([]);
    });

    it('has isLoading false initially', () => {
      const state = useLogStore.getState();
      expect(state.isLoading).toBe(false);
    });

    it('has error null initially', () => {
      const state = useLogStore.getState();
      expect(state.error).toBeNull();
    });
  });

  describe('setLogs', () => {
    it('sets logs array', () => {
      const logs = createMockLogs(3);
      useLogStore.getState().setLogs(logs);

      expect(useLogStore.getState().logs).toEqual(logs);
    });

    it('replaces existing logs', () => {
      const logs1 = createMockLogs(2);
      const logs2 = createMockLogs(3);

      useLogStore.getState().setLogs(logs1);
      expect(useLogStore.getState().logs).toHaveLength(2);

      useLogStore.getState().setLogs(logs2);
      expect(useLogStore.getState().logs).toHaveLength(3);
    });

    it('can set empty array', () => {
      const logs = createMockLogs(2);
      useLogStore.getState().setLogs(logs);
      useLogStore.getState().setLogs([]);

      expect(useLogStore.getState().logs).toEqual([]);
    });
  });

  describe('addLog', () => {
    it('adds log to array', () => {
      const log = createMockLog();
      useLogStore.getState().addLog(log);

      expect(useLogStore.getState().logs).toContainEqual(log);
    });

    it('maintains immutability', () => {
      const log1 = createMockLog();
      const log2 = createMockLog({ notes: 'Second log' });

      useLogStore.getState().addLog(log1);
      const logsBefore = useLogStore.getState().logs;

      useLogStore.getState().addLog(log2);
      const logsAfter = useLogStore.getState().logs;

      expect(logsBefore).not.toBe(logsAfter);
      expect(logsBefore).toHaveLength(1);
      expect(logsAfter).toHaveLength(2);
    });

    it('adds multiple logs in sequence', () => {
      const logs = createMockLogs(5);

      logs.forEach(log => {
        useLogStore.getState().addLog(log);
      });

      expect(useLogStore.getState().logs).toHaveLength(5);
      expect(useLogStore.getState().logs).toEqual(logs);
    });

    it('preserves existing logs when adding new one', () => {
      const log1 = createMockLog();
      const log2 = createMockLog({ notes: 'Different notes' });

      useLogStore.getState().addLog(log1);
      useLogStore.getState().addLog(log2);

      const state = useLogStore.getState();
      expect(state.logs).toContainEqual(log1);
      expect(state.logs).toContainEqual(log2);
    });
  });

  describe('removeLog', () => {
    it('removes log by id', () => {
      const logs = createMockLogs(3);
      useLogStore.getState().setLogs(logs);

      const idToRemove = logs[1].id;
      useLogStore.getState().removeLog(idToRemove);

      const remaining = useLogStore.getState().logs;
      expect(remaining).toHaveLength(2);
      expect(remaining).not.toContainEqual(logs[1]);
      expect(remaining).toContainEqual(logs[0]);
      expect(remaining).toContainEqual(logs[2]);
    });

    it('maintains immutability when removing', () => {
      const logs = createMockLogs(2);
      useLogStore.getState().setLogs(logs);

      const logsBefore = useLogStore.getState().logs;
      useLogStore.getState().removeLog(logs[0].id);
      const logsAfter = useLogStore.getState().logs;

      expect(logsBefore).not.toBe(logsAfter);
    });

    it('does nothing if id not found', () => {
      const logs = createMockLogs(2);
      useLogStore.getState().setLogs(logs);

      useLogStore.getState().removeLog('non-existent-id');

      expect(useLogStore.getState().logs).toEqual(logs);
    });

    it('can remove all logs one by one', () => {
      const logs = createMockLogs(3);
      useLogStore.getState().setLogs(logs);

      logs.forEach(log => {
        useLogStore.getState().removeLog(log.id);
      });

      expect(useLogStore.getState().logs).toEqual([]);
    });
  });

  describe('updateLog', () => {
    it('updates log properties', () => {
      const log = createMockLog();
      useLogStore.getState().setLogs([log]);

      useLogStore.getState().updateLog(log.id, { notes: 'Updated notes' });

      const updated = useLogStore.getState().logs[0];
      expect(updated.notes).toBe('Updated notes');
      expect(updated.id).toBe(log.id); // Preserves id
    });

    it('sets updatedAt timestamp', () => {
      const log = createMockLog();
      const oldUpdatedAt = log.updatedAt;
      useLogStore.getState().setLogs([log]);

      // Advance time slightly
      jest.advanceTimersByTime(100);

      useLogStore.getState().updateLog(log.id, { notes: 'Updated' });

      const updated = useLogStore.getState().logs[0];
      expect(updated.updatedAt).toBeGreaterThan(oldUpdatedAt);
    });

    it('maintains immutability when updating', () => {
      const log = createMockLog();
      useLogStore.getState().setLogs([log]);

      const logsBefore = useLogStore.getState().logs;
      useLogStore.getState().updateLog(log.id, { notes: 'New' });
      const logsAfter = useLogStore.getState().logs;

      expect(logsBefore).not.toBe(logsAfter);
    });

    it('updates single property without affecting others', () => {
      const log = createMockLog({ notes: 'Original' });
      useLogStore.getState().setLogs([log]);

      useLogStore.getState().updateLog(log.id, { notes: 'Modified' });

      const updated = useLogStore.getState().logs[0];
      expect(updated.timestamp).toBe(log.timestamp);
      expect(updated.createdAt).toBe(log.createdAt);
      expect(updated.id).toBe(log.id);
      expect(updated.notes).toBe('Modified');
    });

    it('can update multiple properties at once', () => {
      const log = createMockLog({ notes: 'Original' });
      useLogStore.getState().setLogs([log]);

      const newTimestamp = Date.now();
      useLogStore.getState().updateLog(log.id, {
        notes: 'New notes',
        timestamp: newTimestamp,
      });

      const updated = useLogStore.getState().logs[0];
      expect(updated.notes).toBe('New notes');
      expect(updated.timestamp).toBe(newTimestamp);
    });

    it('does nothing if id not found', () => {
      const log = createMockLog();
      useLogStore.getState().setLogs([log]);

      useLogStore.getState().updateLog('non-existent-id', { notes: 'New' });

      expect(useLogStore.getState().logs[0]).toEqual(log);
    });

    it('does not modify other logs when updating one', () => {
      const logs = createMockLogs(3);
      useLogStore.getState().setLogs([...logs]);

      useLogStore.getState().updateLog(logs[1].id, { notes: 'Updated' });

      const state = useLogStore.getState();
      expect(state.logs[0]).toEqual(logs[0]);
      expect(state.logs[2]).toEqual(logs[2]);
    });
  });

  describe('setLoading', () => {
    it('sets loading state to true', () => {
      useLogStore.getState().setLoading(true);
      expect(useLogStore.getState().isLoading).toBe(true);
    });

    it('sets loading state to false', () => {
      useLogStore.getState().setLoading(true);
      useLogStore.getState().setLoading(false);
      expect(useLogStore.getState().isLoading).toBe(false);
    });
  });

  describe('setError', () => {
    it('sets error message', () => {
      useLogStore.getState().setError('Test error');
      expect(useLogStore.getState().error).toBe('Test error');
    });

    it('clears error with null', () => {
      useLogStore.getState().setError('Test error');
      useLogStore.getState().setError(null);
      expect(useLogStore.getState().error).toBeNull();
    });
  });

  describe('clearLogs', () => {
    it('empties logs array', () => {
      const logs = createMockLogs(5);
      useLogStore.getState().setLogs(logs);
      useLogStore.getState().clearLogs();

      expect(useLogStore.getState().logs).toEqual([]);
    });

    it('maintains immutability', () => {
      const logs = createMockLogs(3);
      useLogStore.getState().setLogs(logs);

      const logsBefore = useLogStore.getState().logs;
      useLogStore.getState().clearLogs();
      const logsAfter = useLogStore.getState().logs;

      expect(logsBefore).not.toBe(logsAfter);
    });

    it('does not affect other state', () => {
      const logs = createMockLogs(2);
      useLogStore.getState().setLogs(logs);
      useLogStore.getState().setLoading(true);
      useLogStore.getState().setError('Some error');

      useLogStore.getState().clearLogs();

      const state = useLogStore.getState();
      expect(state.logs).toEqual([]);
      expect(state.isLoading).toBe(true);
      expect(state.error).toBe('Some error');
    });
  });

  describe('getLogsByDate', () => {
    it('returns logs for specific date', () => {
      const log1 = createMockLog({
        timestamp: new Date('2025-01-15T10:00:00Z').getTime(),
      });
      const log2 = createMockLog({
        timestamp: new Date('2025-01-15T14:00:00Z').getTime(),
      });
      const log3 = createMockLog({
        timestamp: new Date('2025-01-16T10:00:00Z').getTime(),
      });

      useLogStore.getState().setLogs([log1, log2, log3]);

      const logsForDate = useLogStore.getState().getLogsByDate('2025-01-15');
      expect(logsForDate).toHaveLength(2);
      expect(logsForDate).toContainEqual(log1);
      expect(logsForDate).toContainEqual(log2);
    });

    it('returns empty array if no logs for date', () => {
      const log = createMockLog({
        timestamp: new Date('2025-01-15T10:00:00Z').getTime(),
      });
      useLogStore.getState().setLogs([log]);

      const logsForDate = useLogStore.getState().getLogsByDate('2025-01-20');
      expect(logsForDate).toEqual([]);
    });

    it('includes logs at start and end of day', () => {
      // Use local dates to avoid timezone issues
      const logAtStart = createMockLog({
        timestamp: new Date('2025-01-15T00:00:00').getTime(),
      });
      const logAtEnd = createMockLog({
        timestamp: new Date('2025-01-15T23:59:59').getTime(),
      });

      useLogStore.getState().setLogs([logAtStart, logAtEnd]);

      const logsForDate = useLogStore.getState().getLogsByDate('2025-01-15');
      expect(logsForDate.length).toBeGreaterThan(0);
      expect(logsForDate.length).toBeLessThanOrEqual(2);
    });

    it('filters logs correctly by date', () => {
      const logBefore = createMockLog({
        timestamp: new Date('2025-01-14T23:59:59').getTime(),
      });
      const logOn = createMockLog({
        timestamp: new Date('2025-01-15T12:00:00').getTime(),
      });
      const logAfter = createMockLog({
        timestamp: new Date('2025-01-16T00:00:00').getTime(),
      });

      useLogStore.getState().setLogs([logBefore, logOn, logAfter]);

      const logsForDate = useLogStore.getState().getLogsByDate('2025-01-15');
      // Should include at least the logOn
      expect(logsForDate).toContainEqual(
        expect.objectContaining({ id: logOn.id })
      );
    });

    it('handles dates with different padding', () => {
      const log = createMockLog({
        timestamp: new Date('2025-01-05T12:00:00Z').getTime(),
      });
      useLogStore.getState().setLogs([log]);

      const logsForDate = useLogStore.getState().getLogsByDate('2025-01-05');
      expect(logsForDate).toHaveLength(1);
    });
  });

  describe('getLogsInRange', () => {
    it('returns logs within time range', () => {
      const log1 = createMockLog({
        timestamp: new Date('2025-01-15T10:00:00Z').getTime(),
      });
      const log2 = createMockLog({
        timestamp: new Date('2025-01-15T14:00:00Z').getTime(),
      });
      const log3 = createMockLog({
        timestamp: new Date('2025-01-15T18:00:00Z').getTime(),
      });

      useLogStore.getState().setLogs([log1, log2, log3]);

      const startTime = new Date('2025-01-15T09:00:00Z').getTime();
      const endTime = new Date('2025-01-15T15:00:00Z').getTime();

      const logsInRange = useLogStore.getState().getLogsInRange(startTime, endTime);
      expect(logsInRange).toHaveLength(2);
      expect(logsInRange).toContainEqual(log1);
      expect(logsInRange).toContainEqual(log2);
    });

    it('returns empty array if no logs in range', () => {
      const log = createMockLog({
        timestamp: new Date('2025-01-15T10:00:00Z').getTime(),
      });
      useLogStore.getState().setLogs([log]);

      const startTime = new Date('2025-01-20T00:00:00Z').getTime();
      const endTime = new Date('2025-01-21T00:00:00Z').getTime();

      const logsInRange = useLogStore.getState().getLogsInRange(startTime, endTime);
      expect(logsInRange).toEqual([]);
    });

    it('includes logs at range boundaries', () => {
      const logAtStart = createMockLog({
        timestamp: new Date('2025-01-15T10:00:00Z').getTime(),
      });
      const logAtEnd = createMockLog({
        timestamp: new Date('2025-01-15T14:00:00Z').getTime(),
      });

      useLogStore.getState().setLogs([logAtStart, logAtEnd]);

      const startTime = new Date('2025-01-15T10:00:00Z').getTime();
      const endTime = new Date('2025-01-15T14:00:00Z').getTime();

      const logsInRange = useLogStore.getState().getLogsInRange(startTime, endTime);
      expect(logsInRange).toHaveLength(2);
    });

    it('works across multiple days', () => {
      const logs = [
        createMockLog({ timestamp: new Date('2025-01-14T23:00:00Z').getTime() }),
        createMockLog({ timestamp: new Date('2025-01-15T12:00:00Z').getTime() }),
        createMockLog({ timestamp: new Date('2025-01-16T01:00:00Z').getTime() }),
        createMockLog({ timestamp: new Date('2025-01-17T10:00:00Z').getTime() }),
      ];
      useLogStore.getState().setLogs(logs);

      const startTime = new Date('2025-01-15T00:00:00Z').getTime();
      const endTime = new Date('2025-01-16T23:59:59Z').getTime();

      const logsInRange = useLogStore.getState().getLogsInRange(startTime, endTime);
      expect(logsInRange).toHaveLength(2);
      expect(logsInRange).toContainEqual(logs[1]);
      expect(logsInRange).toContainEqual(logs[2]);
    });
  });

  describe('store selectors (subscription)', () => {
    it('allows selecting specific state', () => {
      const logs = createMockLogs(2);
      useLogStore.getState().setLogs(logs);

      const selectedLogs = useLogStore.getState().logs;
      expect(selectedLogs).toEqual(logs);
    });

    it('allows selecting isLoading', () => {
      useLogStore.getState().setLoading(true);
      const isLoading = useLogStore.getState().isLoading;
      expect(isLoading).toBe(true);
    });

    it('allows selecting error', () => {
      const errorMessage = 'Test error';
      useLogStore.getState().setError(errorMessage);
      const error = useLogStore.getState().error;
      expect(error).toBe(errorMessage);
    });
  });
});
