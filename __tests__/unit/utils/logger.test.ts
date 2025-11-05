/**
 * Logger Unit Tests
 *
 * Tests the production-grade logging system
 */

import { logger, LogLevel } from '../../../src/utils/logger';

describe('Logger', () => {
  beforeEach(() => {
    // Clear console mocks
    jest.clearAllMocks();

    // Clear log buffer
    logger.clearLogBuffer();

    // Spy on console methods
    jest.spyOn(console, 'debug').mockImplementation();
    jest.spyOn(console, 'info').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Basic Logging', () => {
    it('should log debug messages', () => {
      logger.debug('Debug message', { test: true });

      expect(console.debug).toHaveBeenCalledWith(
        expect.stringContaining('[DEBUG] Debug message')
      );
    });

    it('should log info messages', () => {
      logger.info('Info message', { test: true });

      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining('[INFO] Info message')
      );
    });

    it('should log warning messages', () => {
      logger.warn('Warning message', { test: true });

      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('[WARN] Warning message')
      );
    });

    it('should log error messages', () => {
      const error = new Error('Test error');
      logger.error('Error message', { test: true }, error);

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('[ERROR] Error message')
      );
    });

    it('should log fatal messages', () => {
      const error = new Error('Fatal error');
      logger.fatal('Fatal message', { test: true }, error);

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('[FATAL] Fatal message')
      );
    });
  });

  describe('Context Management', () => {
    it('should set and include global context', () => {
      logger.setContext({ userId: 'user123', screen: 'home' });
      logger.info('Test with context');

      const logs = logger.getLogBuffer();
      const lastLog = logs[logs.length - 1];

      expect(lastLog.context).toMatchObject({
        userId: 'user123',
        screen: 'home'
      });
    });

    it('should merge local context with global context', () => {
      logger.setContext({ userId: 'user123' });
      logger.info('Test', { screen: 'logs' });

      const logs = logger.getLogBuffer();
      const lastLog = logs[logs.length - 1];

      expect(lastLog.context).toMatchObject({
        userId: 'user123',
        screen: 'logs'
      });
    });

    it('should clear global context', () => {
      logger.setContext({ userId: 'user123' });
      logger.clearContext();
      logger.info('Test after clear');

      const logs = logger.getLogBuffer();
      const lastLog = logs[logs.length - 1];

      expect(lastLog.context?.userId).toBeUndefined();
    });
  });

  describe('Log Buffer', () => {
    it('should add logs to buffer', () => {
      logger.info('Test 1');
      logger.info('Test 2');
      logger.info('Test 3');

      const logs = logger.getLogBuffer();
      expect(logs.length).toBeGreaterThanOrEqual(3);
    });

    it('should get logs by level', () => {
      logger.info('Info message');
      logger.error('Error message');
      logger.warn('Warning message');

      const errorLogs = logger.getLogsByLevel(LogLevel.ERROR);
      expect(errorLogs.length).toBeGreaterThanOrEqual(1);
      expect(errorLogs[0].levelName).toBe('ERROR');
    });

    it('should get recent errors', () => {
      logger.error('Error 1');
      logger.info('Info message');
      logger.error('Error 2');

      const recentErrors = logger.getRecentErrors(5);
      expect(recentErrors.length).toBeGreaterThanOrEqual(2);
      expect(recentErrors.every(log => log.level >= LogLevel.ERROR)).toBe(true);
    });

    it('should clear log buffer', () => {
      logger.info('Test 1');
      logger.info('Test 2');
      logger.clearLogBuffer();

      const logs = logger.getLogBuffer();
      // Should only have the "Log buffer cleared" message
      expect(logs.length).toBe(1);
      expect(logs[0].message).toBe('Log buffer cleared');
    });
  });

  describe('Performance Tracking', () => {
    it('should track performance with timer', () => {
      const stopTimer = logger.startPerformanceTimer('test_operation');

      // Simulate some work
      const result = 1 + 1;

      stopTimer();

      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining('Performance: test_operation')
      );
    });

    it('should measure async operations', async () => {
      const asyncOperation = async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return 'result';
      };

      const result = await logger.measureAsync(
        'async_test',
        asyncOperation,
        { test: true }
      );

      expect(result).toBe('result');
      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining('Performance: async_test')
      );
    });

    it('should log errors in failed async operations', async () => {
      const failingOperation = async () => {
        throw new Error('Operation failed');
      };

      await expect(
        logger.measureAsync('failing_operation', failingOperation)
      ).rejects.toThrow('Operation failed');

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed: failing_operation')
      );
    });
  });

  describe('User Action Tracking', () => {
    it('should track user actions', () => {
      logger.trackAction('button_click', 'home', { buttonId: 'add_log' });

      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining('User Action: button_click')
      );

      const logs = logger.getLogBuffer();
      const lastLog = logs[logs.length - 1];

      expect(lastLog.context).toMatchObject({
        screen: 'home',
        action: 'button_click',
        buttonId: 'add_log'
      });
    });

    it('should track screen views', () => {
      logger.trackScreen('logs', { previousScreen: 'home' });

      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining('Screen View: logs')
      );

      const logs = logger.getLogBuffer();
      const lastLog = logs[logs.length - 1];

      expect(lastLog.context).toMatchObject({
        screen: 'logs',
        previousScreen: 'home'
      });
    });
  });

  describe('Log Export', () => {
    it('should export logs as JSON', () => {
      logger.info('Test 1');
      logger.warn('Test 2');
      logger.error('Test 3');

      const exported = logger.exportLogs();
      const parsed = JSON.parse(exported);

      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Error Handling', () => {
    it('should include error stack traces', () => {
      const error = new Error('Test error with stack');
      logger.error('Error occurred', {}, error);

      const logs = logger.getLogBuffer();
      const lastLog = logs[logs.length - 1];

      expect(lastLog.error).toBeDefined();
      expect(lastLog.error?.name).toBe('Error');
      expect(lastLog.error?.message).toBe('Test error with stack');
      expect(lastLog.error?.stack).toBeDefined();
    });

    it('should handle errors without context', () => {
      const error = new Error('Simple error');
      logger.error('Error without context', undefined, error);

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('[ERROR] Error without context')
      );
    });
  });
});
