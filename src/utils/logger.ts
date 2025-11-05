/**
 * Production-Grade Logging System for VibeKeeper
 *
 * Features:
 * - Multiple log levels (DEBUG, INFO, WARN, ERROR, FATAL)
 * - Context tracking (screen, action, user flow)
 * - Structured logging for analysis
 * - Error tracking with stack traces
 * - Performance monitoring
 * - Platform-aware (iOS, Android, Web)
 * - Environment-aware (dev, production)
 * - Integration with crash reporting services
 */

import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Log Levels
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
}

// Log Context Interface
export interface LogContext {
  screen?: string;
  action?: string;
  userId?: string;
  sessionId?: string;
  [key: string]: any;
}

// Log Entry Interface
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  levelName: string;
  message: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  platform: string;
  version: string;
  environment: string;
}

// Performance Measurement
export interface PerformanceMetric {
  operation: string;
  duration: number;
  timestamp: string;
  context?: LogContext;
}

class Logger {
  private static instance: Logger;
  private minLogLevel: LogLevel;
  private logBuffer: LogEntry[] = [];
  private maxBufferSize: number = 1000;
  private sessionId: string;
  private context: LogContext = {};

  private constructor() {
    this.minLogLevel = __DEV__ ? LogLevel.DEBUG : LogLevel.INFO;
    this.sessionId = this.generateSessionId();
    this.initializeLogger();
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private initializeLogger(): void {
    this.log(LogLevel.INFO, 'Logger initialized', {
      platform: Platform.OS,
      version: Constants.expoConfig?.version || '1.0.0',
      environment: __DEV__ ? 'development' : 'production',
      sessionId: this.sessionId,
    });
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Set global context that will be included in all logs
   */
  setContext(context: LogContext): void {
    this.context = { ...this.context, ...context };
  }

  /**
   * Clear global context
   */
  clearContext(): void {
    this.context = {};
  }

  /**
   * Set minimum log level
   */
  setMinLogLevel(level: LogLevel): void {
    this.minLogLevel = level;
  }

  /**
   * Core logging method
   */
  private log(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error
  ): void {
    if (level < this.minLogLevel) {
      return;
    }

    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      levelName: LogLevel[level],
      message,
      context: { ...this.context, ...context, sessionId: this.sessionId },
      platform: Platform.OS,
      version: Constants.expoConfig?.version || '1.0.0',
      environment: __DEV__ ? 'development' : 'production',
    };

    if (error) {
      logEntry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    // Add to buffer
    this.addToBuffer(logEntry);

    // Console output with formatting
    this.consoleOutput(logEntry);

    // In production, send to external service (e.g., Sentry)
    if (!__DEV__ && level >= LogLevel.ERROR) {
      this.sendToExternalService(logEntry);
    }
  }

  private addToBuffer(entry: LogEntry): void {
    this.logBuffer.push(entry);

    // Maintain buffer size
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer.shift();
    }
  }

  private consoleOutput(entry: LogEntry): void {
    const prefix = `[${entry.levelName}]`;
    const contextStr = entry.context
      ? `\nContext: ${JSON.stringify(entry.context, null, 2)}`
      : '';
    const errorStr = entry.error
      ? `\nError: ${entry.error.message}\nStack: ${entry.error.stack}`
      : '';

    const output = `${prefix} ${entry.message}${contextStr}${errorStr}`;

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(output);
        break;
      case LogLevel.INFO:
        console.info(output);
        break;
      case LogLevel.WARN:
        console.warn(output);
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(output);
        break;
    }
  }

  private sendToExternalService(entry: LogEntry): void {
    // TODO: Integration with Sentry, Firebase Crashlytics, etc.
    // For now, just log that we would send
    if (__DEV__) {
      console.log('[Logger] Would send to external service:', entry);
    }
  }

  /**
   * Public logging methods
   */
  debug(message: string, context?: LogContext): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: LogContext, error?: Error): void {
    this.log(LogLevel.WARN, message, context, error);
  }

  error(message: string, context?: LogContext, error?: Error): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  fatal(message: string, context?: LogContext, error?: Error): void {
    this.log(LogLevel.FATAL, message, context, error);
  }

  /**
   * Performance tracking
   */
  startPerformanceTimer(operation: string): () => void {
    const startTime = Date.now();

    return () => {
      const duration = Date.now() - startTime;
      const metric: PerformanceMetric = {
        operation,
        duration,
        timestamp: new Date().toISOString(),
        context: this.context,
      };

      this.info(`Performance: ${operation}`, {
        ...metric,
        durationMs: duration,
      });

      return metric;
    };
  }

  /**
   * Measure async operation performance
   */
  async measureAsync<T>(
    operation: string,
    fn: () => Promise<T>,
    context?: LogContext
  ): Promise<T> {
    const stopTimer = this.startPerformanceTimer(operation);

    try {
      const result = await fn();
      stopTimer();
      return result;
    } catch (error) {
      stopTimer();
      this.error(`Failed: ${operation}`, context, error as Error);
      throw error;
    }
  }

  /**
   * Track user actions
   */
  trackAction(action: string, screen: string, metadata?: Record<string, any>): void {
    this.info(`User Action: ${action}`, {
      screen,
      action,
      ...metadata,
    });
  }

  /**
   * Track screen views
   */
  trackScreen(screenName: string, metadata?: Record<string, any>): void {
    this.info(`Screen View: ${screenName}`, {
      screen: screenName,
      ...metadata,
    });
  }

  /**
   * Get all buffered logs
   */
  getLogBuffer(): LogEntry[] {
    return [...this.logBuffer];
  }

  /**
   * Clear log buffer
   */
  clearLogBuffer(): void {
    this.logBuffer = [];
    this.info('Log buffer cleared');
  }

  /**
   * Export logs for debugging
   */
  exportLogs(): string {
    return JSON.stringify(this.logBuffer, null, 2);
  }

  /**
   * Get logs by level
   */
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logBuffer.filter(entry => entry.level === level);
  }

  /**
   * Get recent errors
   */
  getRecentErrors(count: number = 10): LogEntry[] {
    return this.logBuffer
      .filter(entry => entry.level >= LogLevel.ERROR)
      .slice(-count);
  }
}

// Export singleton instance
export const logger = Logger.getInstance();

// Convenience exports
export const {
  debug,
  info,
  warn,
  error,
  fatal,
  setContext,
  clearContext,
  trackAction,
  trackScreen,
  startPerformanceTimer,
  measureAsync,
  getLogBuffer,
  clearLogBuffer,
  exportLogs,
  getRecentErrors,
} = logger;
