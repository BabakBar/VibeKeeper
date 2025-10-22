import { db } from '../db';
import { cigaretteLogs } from '../db/schema';
import { useLogStore } from '../stores/logStore';
import { CigaretteLog as ILogType } from '../types';
import { eq } from 'drizzle-orm';
import * as crypto from 'crypto';

/**
 * LogService handles all cigarette log operations
 */
export class LogService {
  /**
   * Load all logs from database
   */
  static async loadLogs(): Promise<ILogType[]> {
    try {
      useLogStore.setState({ isLoading: true, error: null });

      // Query all logs sorted by timestamp descending
      const logs = await db
        .select()
        .from(cigaretteLogs)
        .orderBy(cigaretteLogs.timestamp)
        .all() as any[];

      // Convert database format to app format
      const formattedLogs: ILogType[] = logs.map((log) => ({
        id: log.id,
        timestamp: log.timestamp,
        notes: log.notes || undefined,
        time: log.time || undefined,
        createdAt: log.created_at,
        updatedAt: log.updated_at,
      }));

      useLogStore.setState({ logs: formattedLogs });
      return formattedLogs;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load logs';
      useLogStore.setState({ error: errorMessage });
      throw error;
    } finally {
      useLogStore.setState({ isLoading: false });
    }
  }

  /**
   * Add a new cigarette log
   */
  static async addLog(input: {
    timestamp?: number;
    notes?: string;
    time?: string;
  }): Promise<ILogType> {
    try {
      useLogStore.setState({ isLoading: true, error: null });

      const id = crypto.randomUUID?.() || `log_${Date.now()}_${Math.random()}`;
      const now = Date.now();

      const newLog: ILogType = {
        id,
        timestamp: input.timestamp || now,
        notes: input.notes,
        time: input.time,
        createdAt: now,
        updatedAt: now,
      };

      // Insert into database
      await db.insert(cigaretteLogs).values({
        id,
        timestamp: newLog.timestamp,
        notes: newLog.notes || null,
        time: newLog.time || null,
        created_at: now,
        updated_at: now,
      } as any);

      // Update store
      useLogStore.getState().addLog(newLog);
      return newLog;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add log';
      useLogStore.setState({ error: errorMessage });
      throw error;
    } finally {
      useLogStore.setState({ isLoading: false });
    }
  }

  /**
   * Update an existing log
   */
  static async updateLog(
    id: string,
    updates: Partial<ILogType>
  ): Promise<ILogType> {
    try {
      useLogStore.setState({ isLoading: true, error: null });

      const now = Date.now();

      // Update database
      await db
        .update(cigaretteLogs)
        .set({
          timestamp: updates.timestamp,
          notes: updates.notes || null,
          time: updates.time || null,
          updated_at: now,
        } as any)
        .where(eq(cigaretteLogs.id, id))
        .run();

      // Get updated log
      const logs = useLogStore.getState().logs;
      const updatedLog = logs.find((log) => log.id === id);

      if (!updatedLog) {
        throw new Error('Log not found');
      }

      return { ...updatedLog, ...updates, updatedAt: now };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update log';
      useLogStore.setState({ error: errorMessage });
      throw error;
    } finally {
      useLogStore.setState({ isLoading: false });
    }
  }

  /**
   * Delete a log
   */
  static async deleteLog(id: string): Promise<void> {
    try {
      useLogStore.setState({ isLoading: true, error: null });

      // Delete from database
      await db
        .delete(cigaretteLogs)
        .where(eq(cigaretteLogs.id, id))
        .run();

      // Update store
      useLogStore.getState().removeLog(id);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete log';
      useLogStore.setState({ error: errorMessage });
      throw error;
    } finally {
      useLogStore.setState({ isLoading: false });
    }
  }

  /**
   * Quick log - add cigarette with current timestamp
   */
  static async quickLog(): Promise<ILogType> {
    return this.addLog({ timestamp: Date.now() });
  }

  /**
   * Get logs for a specific date (YYYY-MM-DD)
   */
  static getLogsByDate(date: string): ILogType[] {
    return useLogStore.getState().getLogsByDate(date);
  }

  /**
   * Get logs in a time range
   */
  static getLogsInRange(startTime: number, endTime: number): ILogType[] {
    return useLogStore.getState().getLogsInRange(startTime, endTime);
  }

  /**
   * Get count of logs for a specific date
   */
  static getCountByDate(date: string): number {
    return this.getLogsByDate(date).length;
  }
}
