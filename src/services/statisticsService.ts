import { useLogStore } from '../stores/logStore';
import { useSettingsStore } from '../stores/settingsStore';
import { DailyStats, WeeklyStats, MonthlyStats } from '../types';

/**
 * StatisticsService calculates statistics from logs
 */
export class StatisticsService {
  /**
   * Format date as YYYY-MM-DD
   */
  private static formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Get daily stats for a specific date
   */
  static getDailyStats(date: string): DailyStats {
    const logs = useLogStore.getState().getLogsByDate(date);
    const costPerCigarette = useSettingsStore.getState().getCostPerCigarette();

    return {
      date,
      total: logs.length,
      cost: logs.length * costPerCigarette,
    };
  }

  /**
   * Get stats for today
   */
  static getTodayStats(): DailyStats {
    const today = this.formatDate(new Date());
    return this.getDailyStats(today);
  }

  /**
   * Get weekly stats
   */
  static getWeeklyStats(date: Date = new Date()): WeeklyStats {
    const year = date.getFullYear();
    const month = date.getMonth();
    const dayOfWeek = date.getDay();

    // Get start of week (Sunday)
    const startOfWeek = new Date(year, month, date.getDate() - dayOfWeek);
    // Get end of week (Saturday)
    const endOfWeek = new Date(year, month, date.getDate() + (6 - dayOfWeek));

    const startTime = startOfWeek.getTime();
    const endTime = endOfWeek.getTime();

    const logs = useLogStore.getState().getLogsInRange(startTime, endTime);
    const costPerCigarette = useSettingsStore.getState().getCostPerCigarette();

    // Build daily breakdown
    const dailyBreakdown: DailyStats[] = [];
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startOfWeek);
      currentDate.setDate(currentDate.getDate() + i);
      const dateStr = this.formatDate(currentDate);

      const dayLogs = useLogStore.getState().getLogsByDate(dateStr);
      dailyBreakdown.push({
        date: dateStr,
        total: dayLogs.length,
        cost: dayLogs.length * costPerCigarette,
      });
    }

    const total = logs.length;
    const week = Math.ceil((date.getDate() + new Date(year, month, 1).getDay()) / 7);

    return {
      week,
      year,
      total,
      dailyBreakdown,
      average: dailyBreakdown.length > 0 ? total / dailyBreakdown.length : 0,
      cost: total * costPerCigarette,
    };
  }

  /**
   * Get monthly stats
   */
  static getMonthlyStats(month: number = new Date().getMonth() + 1, year: number = new Date().getFullYear()): MonthlyStats {
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0);

    const startTime = startOfMonth.getTime();
    const endTime = endOfMonth.getTime();

    const logs = useLogStore.getState().getLogsInRange(startTime, endTime);
    const costPerCigarette = useSettingsStore.getState().getCostPerCigarette();

    // Build daily breakdown
    const dailyBreakdown: DailyStats[] = [];
    const daysInMonth = endOfMonth.getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = this.formatDate(new Date(year, month - 1, day));
      const dayLogs = useLogStore.getState().getLogsByDate(dateStr);

      dailyBreakdown.push({
        date: dateStr,
        total: dayLogs.length,
        cost: dayLogs.length * costPerCigarette,
      });
    }

    // Build weekly breakdown
    const weeklyBreakdown: WeeklyStats[] = [];
    for (let week = 1; week <= 6; week++) {
      const weekStartDate = new Date(startOfMonth);
      weekStartDate.setDate(1 + (week - 1) * 7);

      if (weekStartDate.getMonth() === month - 1) {
        weeklyBreakdown.push(this.getWeeklyStats(weekStartDate));
      }
    }

    const total = logs.length;

    return {
      month,
      year,
      total,
      dailyBreakdown,
      weeklyBreakdown,
      average: dailyBreakdown.length > 0 ? total / dailyBreakdown.length : 0,
      cost: total * costPerCigarette,
    };
  }

  /**
   * Get stats for past N days
   */
  static getStatsForPastDays(days: number): DailyStats[] {
    const stats: DailyStats[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = this.formatDate(date);
      stats.push(this.getDailyStats(dateStr));
    }

    return stats;
  }

  /**
   * Get summary stats (total, average, cost)
   */
  static getSummaryStats() {
    const logs = useLogStore.getState().logs;
    const costPerCigarette = useSettingsStore.getState().getCostPerCigarette();

    if (logs.length === 0) {
      return {
        totalLogs: 0,
        totalCost: 0,
        averagePerDay: 0,
        firstLogDate: null,
        lastLogDate: null,
      };
    }

    // Get date range
    const sortedLogs = [...logs].sort((a, b) => a.timestamp - b.timestamp);
    const firstLogDate = new Date(sortedLogs[0].timestamp);
    const lastLogDate = new Date(sortedLogs[sortedLogs.length - 1].timestamp);

    const daysDiff = Math.floor(
      (lastLogDate.getTime() - firstLogDate.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;

    return {
      totalLogs: logs.length,
      totalCost: logs.length * costPerCigarette,
      averagePerDay: logs.length / Math.max(daysDiff, 1),
      firstLogDate: this.formatDate(firstLogDate),
      lastLogDate: this.formatDate(lastLogDate),
    };
  }

  /**
   * Calculate streak (consecutive days with logs)
   */
  static getStreak(): number {
    const logs = useLogStore.getState().logs;
    if (logs.length === 0) return 0;

    const dates = new Set(
      logs.map((log) => this.formatDate(new Date(log.timestamp)))
    );

    let streak = 0;
    const today = new Date();

    for (let i = 0; i < 365; i++) {
      const currentDate = new Date(today);
      currentDate.setDate(currentDate.getDate() - i);
      const dateStr = this.formatDate(currentDate);

      if (dates.has(dateStr)) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    return streak;
  }
}
