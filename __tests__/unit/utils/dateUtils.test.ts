/**
 * Unit tests for dateUtils
 *
 * Tests pure date formatting and calculation functions
 * Uses fake timers (jest.useFakeTimers) for deterministic date tests
 */

import {
  formatDate,
  formatTime,
  formatDateTime,
  getStartOfDay,
  getEndOfDay,
  getStartOfWeek,
  getEndOfWeek,
  getStartOfMonth,
  getEndOfMonth,
  isToday,
  daysBetween,
  getRelativeTime,
} from '../../../src/utils/dateUtils';
import { setFixedDate } from '../../helpers/testUtils';

describe('dateUtils', () => {
  beforeEach(() => {
    // Set fixed date for deterministic tests
    setFixedDate('2025-01-15T12:00:00Z');
  });

  describe('formatDate', () => {
    it('formats date as YYYY-MM-DD', () => {
      const date = new Date('2025-01-15T12:00:00Z');
      expect(formatDate(date)).toBe('2025-01-15');
    });

    it('pads single-digit months', () => {
      const date = new Date('2025-02-05T12:00:00');
      const result = formatDate(date);
      expect(result).toMatch(/^\d{4}-02-\d{2}$/);
    });

    it('pads single-digit days', () => {
      const date = new Date('2025-01-05T12:00:00');
      const result = formatDate(date);
      expect(result).toMatch(/^\d{4}-01-05$/);
    });

    it('handles various dates correctly', () => {
      const date = new Date('2025-12-31T12:00:00');
      const result = formatDate(date);
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(result).toContain('2025');
    });
  });

  describe('formatTime', () => {
    it('formats timestamp as HH:mm with proper padding', () => {
      const timestamp = new Date('2025-01-15T14:30:00').getTime();
      const result = formatTime(timestamp);
      // Should be HH:mm format with padding
      expect(result).toMatch(/^\d{2}:\d{2}$/);
      // Check it contains hours and minutes
      const [hours, minutes] = result.split(':');
      expect(hours).toMatch(/^\d{2}$/);
      expect(minutes).toMatch(/^\d{2}$/);
    });

    it('pads single-digit minutes correctly', () => {
      const timestamp = new Date('2025-01-15T14:05:00').getTime();
      const result = formatTime(timestamp);
      // Minutes should be padded
      expect(result).toMatch(/:\d{2}$/);
    });

    it('handles times with proper format', () => {
      const timestamp = new Date('2025-01-15T10:00:00').getTime();
      const result = formatTime(timestamp);
      // Should have correct HH:mm format
      expect(result).toMatch(/^\d{2}:\d{2}$/);
      const [hours, minutes] = result.split(':');
      expect(parseInt(minutes)).toBeGreaterThanOrEqual(0);
      expect(parseInt(minutes)).toBeLessThan(60);
    });
  });

  describe('formatDateTime', () => {
    it('formats timestamp as locale date and time', () => {
      const timestamp = new Date('2025-01-15T14:30:00Z').getTime();
      const result = formatDateTime(timestamp);
      // Should contain some date and time information
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
      // Should include year info somewhere
      expect(result).toContain('2025');
    });
  });

  describe('getStartOfDay', () => {
    it('returns midnight (00:00:00) of given date', () => {
      const date = new Date('2025-01-15T14:30:45');
      const start = getStartOfDay(date);
      const resultDate = new Date(start);
      // Should have 00:00:00 time
      expect(resultDate.getHours()).toBe(0);
      expect(resultDate.getMinutes()).toBe(0);
      expect(resultDate.getSeconds()).toBe(0);
    });

    it('uses current date if not provided', () => {
      const start = getStartOfDay();
      const resultDate = new Date(start);
      // Should have 00:00:00 time
      expect(resultDate.getHours()).toBe(0);
      expect(resultDate.getMinutes()).toBe(0);
      expect(resultDate.getSeconds()).toBe(0);
    });

    it('returns earlier time than input', () => {
      const date = new Date('2025-06-15T14:30:00');
      const start = getStartOfDay(date);
      // Start of day should be before the given time
      expect(start).toBeLessThan(date.getTime());
    });
  });

  describe('getEndOfDay', () => {
    it('returns end of day (23:59:59.999)', () => {
      const date = new Date('2025-01-15T14:30:45');
      const end = getEndOfDay(date);
      const resultDate = new Date(end);
      // Should have 23:59:59 time
      expect(resultDate.getHours()).toBe(23);
      expect(resultDate.getMinutes()).toBe(59);
      expect(resultDate.getSeconds()).toBe(59);
    });

    it('uses current date if not provided', () => {
      const end = getEndOfDay();
      const resultDate = new Date(end);
      // Should have 23:59:59 time
      expect(resultDate.getHours()).toBe(23);
      expect(resultDate.getMinutes()).toBe(59);
      expect(resultDate.getSeconds()).toBe(59);
    });
  });

  describe('getStartOfWeek', () => {
    it('returns start of Sunday (Sunday = 0)', () => {
      // 2025-01-15 is a Wednesday
      const date = new Date('2025-01-15T14:30:00Z');
      const start = getStartOfWeek(date);
      const startDate = new Date(start);
      // Should be 2025-01-12 (Sunday)
      expect(formatDate(startDate)).toBe('2025-01-12');
      expect(startDate.getHours()).toBe(0);
      expect(startDate.getMinutes()).toBe(0);
    });

    it('handles Monday (day 1)', () => {
      // 2025-01-13 is a Monday
      const date = new Date('2025-01-13T14:30:00Z');
      const start = getStartOfWeek(date);
      const startDate = new Date(start);
      // Should be 2025-01-12 (Sunday)
      expect(formatDate(startDate)).toBe('2025-01-12');
      expect(startDate.getHours()).toBe(0);
    });

    it('handles Sunday (day 0)', () => {
      // 2025-01-12 is a Sunday
      const date = new Date('2025-01-12T14:30:00Z');
      const start = getStartOfWeek(date);
      const startDate = new Date(start);
      // Should be same day
      expect(formatDate(startDate)).toBe('2025-01-12');
      expect(startDate.getHours()).toBe(0);
    });
  });

  describe('getEndOfWeek', () => {
    it('returns end of Saturday (23:59:59.999)', () => {
      // 2025-01-15 is a Wednesday
      const date = new Date('2025-01-15T14:30:00Z');
      const end = getEndOfWeek(date);
      const endDate = new Date(end);
      // Should be 2025-01-18 (Saturday)
      expect(formatDate(endDate)).toBe('2025-01-18');
      expect(endDate.getHours()).toBe(23);
      expect(endDate.getMinutes()).toBe(59);
      expect(endDate.getSeconds()).toBe(59);
    });

    it('uses current date if not provided', () => {
      // Fixed date is 2025-01-15 (Wednesday)
      const end = getEndOfWeek();
      const endDate = new Date(end);
      // Should be 2025-01-18 (Saturday)
      expect(formatDate(endDate)).toBe('2025-01-18');
      expect(endDate.getHours()).toBe(23);
      expect(endDate.getMinutes()).toBe(59);
    });
  });

  describe('getStartOfMonth', () => {
    it('returns start of month for given month/year', () => {
      const start = getStartOfMonth(1, 2025);
      const startDate = new Date(start);
      expect(formatDate(startDate)).toBe('2025-01-01');
      expect(startDate.getHours()).toBe(0);
      expect(startDate.getMinutes()).toBe(0);
    });

    it('uses current month/year if not provided', () => {
      // Fixed date is 2025-01-15
      const start = getStartOfMonth();
      const startDate = new Date(start);
      expect(formatDate(startDate)).toBe('2025-01-01');
      expect(startDate.getHours()).toBe(0);
    });

    it('handles February leap year', () => {
      // 2024 is leap year
      const start = getStartOfMonth(2, 2024);
      const startDate = new Date(start);
      expect(formatDate(startDate)).toBe('2024-02-01');
      expect(startDate.getHours()).toBe(0);
    });

    it('handles December', () => {
      const start = getStartOfMonth(12, 2025);
      const startDate = new Date(start);
      expect(formatDate(startDate)).toBe('2025-12-01');
      expect(startDate.getHours()).toBe(0);
    });
  });

  describe('getEndOfMonth', () => {
    it('returns end of month for given month/year', () => {
      const end = getEndOfMonth(1, 2025);
      const endDate = new Date(end);
      expect(formatDate(endDate)).toBe('2025-01-31');
      expect(endDate.getHours()).toBe(23);
      expect(endDate.getMinutes()).toBe(59);
    });

    it('uses current month/year if not provided', () => {
      // Fixed date is 2025-01-15
      const end = getEndOfMonth();
      const endDate = new Date(end);
      expect(formatDate(endDate)).toBe('2025-01-31');
      expect(endDate.getHours()).toBe(23);
      expect(endDate.getMinutes()).toBe(59);
    });

    it('handles February non-leap year', () => {
      const end = getEndOfMonth(2, 2025);
      const endDate = new Date(end);
      expect(formatDate(endDate)).toBe('2025-02-28');
      expect(endDate.getHours()).toBe(23);
    });

    it('handles February leap year', () => {
      const end = getEndOfMonth(2, 2024);
      const endDate = new Date(end);
      expect(formatDate(endDate)).toBe('2024-02-29');
      expect(endDate.getHours()).toBe(23);
    });

    it('handles April (30 days)', () => {
      const end = getEndOfMonth(4, 2025);
      const endDate = new Date(end);
      expect(formatDate(endDate)).toBe('2025-04-30');
      expect(endDate.getHours()).toBe(23);
    });
  });

  describe('isToday', () => {
    it('returns true for today', () => {
      // Fixed date is 2025-01-15T12:00:00Z
      const timestamp = new Date('2025-01-15T14:30:00Z').getTime();
      expect(isToday(timestamp)).toBe(true);
    });

    it('returns false for yesterday', () => {
      const timestamp = new Date('2025-01-14T14:30:00Z').getTime();
      expect(isToday(timestamp)).toBe(false);
    });

    it('returns false for tomorrow', () => {
      const timestamp = new Date('2025-01-16T14:30:00Z').getTime();
      expect(isToday(timestamp)).toBe(false);
    });

    it('works at day boundaries', () => {
      // Use local timezone by creating dates without Z
      const startOfToday = new Date(2025, 0, 15, 0, 0, 0).getTime();
      const endOfToday = new Date(2025, 0, 15, 23, 59, 59).getTime();
      expect(isToday(startOfToday)).toBe(true);
      expect(isToday(endOfToday)).toBe(true);
    });
  });

  describe('daysBetween', () => {
    it('returns 0 for same day', () => {
      // Use same exact time to ensure 0 difference
      const timestamp1 = new Date(2025, 0, 15, 10, 0, 0).getTime();
      const timestamp2 = new Date(2025, 0, 15, 10, 0, 0).getTime();
      expect(daysBetween(timestamp1, timestamp2)).toBe(0);
    });

    it('counts days between dates', () => {
      const timestamp1 = new Date('2025-01-15T00:00:00Z').getTime();
      const timestamp2 = new Date('2025-01-20T00:00:00Z').getTime();
      expect(daysBetween(timestamp1, timestamp2)).toBe(5);
    });

    it('handles 1 day difference', () => {
      const timestamp1 = new Date('2025-01-15T00:00:00Z').getTime();
      const timestamp2 = new Date('2025-01-16T00:00:00Z').getTime();
      expect(daysBetween(timestamp1, timestamp2)).toBe(1);
    });

    it('is order-independent', () => {
      const timestamp1 = new Date('2025-01-15T00:00:00Z').getTime();
      const timestamp2 = new Date('2025-01-20T00:00:00Z').getTime();
      expect(daysBetween(timestamp1, timestamp2)).toBe(daysBetween(timestamp2, timestamp1));
    });

    it('rounds up partial days', () => {
      const timestamp1 = new Date('2025-01-15T10:00:00Z').getTime();
      const timestamp2 = new Date('2025-01-16T09:00:00Z').getTime();
      // 23 hours = 0.958 days, should round up to 1
      expect(daysBetween(timestamp1, timestamp2)).toBe(1);
    });
  });

  describe('getRelativeTime', () => {
    it('returns "just now" for seconds ago', () => {
      const now = Date.now();
      const timestamp = now - 30000; // 30 seconds ago
      expect(getRelativeTime(timestamp)).toBe('just now');
    });

    it('returns minutes ago format', () => {
      const now = Date.now();
      const timestamp = now - 600000; // 10 minutes ago
      expect(getRelativeTime(timestamp)).toBe('10m ago');
    });

    it('returns hours ago format', () => {
      const now = Date.now();
      const timestamp = now - 7200000; // 2 hours ago
      expect(getRelativeTime(timestamp)).toBe('2h ago');
    });

    it('returns "yesterday" for 1 day ago', () => {
      const now = Date.now();
      const timestamp = now - 86400000; // 1 day ago
      expect(getRelativeTime(timestamp)).toBe('yesterday');
    });

    it('returns days ago format', () => {
      const now = Date.now();
      const timestamp = now - 259200000; // 3 days ago
      expect(getRelativeTime(timestamp)).toBe('3d ago');
    });

    it('returns formatted date for >7 days ago', () => {
      const now = Date.now();
      const timestamp = now - 864000000; // 10 days ago
      const result = getRelativeTime(timestamp);
      // Should be a formatted date, not "10d ago"
      expect(result).not.toContain('d ago');
      expect(result).toMatch(/\d{4}-\d{2}-\d{2}/);
    });

    it('handles edge case at 60 seconds', () => {
      const now = Date.now();
      const timestamp = now - 60000; // Exactly 60 seconds ago
      expect(getRelativeTime(timestamp)).toBe('1m ago');
    });

    it('handles edge case at 60 minutes', () => {
      const now = Date.now();
      const timestamp = now - 3600000; // Exactly 60 minutes ago
      expect(getRelativeTime(timestamp)).toBe('1h ago');
    });
  });
});
