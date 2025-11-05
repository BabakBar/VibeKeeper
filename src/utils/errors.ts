/**
 * Custom Error Classes for VibeKeeper
 *
 * Provides typed, descriptive errors for better error handling and logging
 */

import { logger } from './logger';

/**
 * Base application error
 */
export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode?: number;
  public readonly context?: Record<string, any>;

  constructor(
    message: string,
    code: string,
    context?: Record<string, any>,
    statusCode?: number
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.context = context;
    this.statusCode = statusCode;

    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);

    // Log error
    logger.error(message, { errorCode: code, ...context }, this);
  }
}

/**
 * Database operation errors
 */
export class DatabaseError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'DATABASE_ERROR', context, 500);
  }
}

/**
 * Validation errors
 */
export class ValidationError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'VALIDATION_ERROR', context, 400);
  }
}

/**
 * Not found errors
 */
export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super(
      `${resource} not found${id ? `: ${id}` : ''}`,
      'NOT_FOUND',
      { resource, id },
      404
    );
  }
}

/**
 * Service errors
 */
export class ServiceError extends AppError {
  constructor(service: string, operation: string, originalError?: Error) {
    super(
      `${service} failed during ${operation}`,
      'SERVICE_ERROR',
      {
        service,
        operation,
        originalError: originalError?.message,
      },
      500
    );
  }
}

/**
 * Network errors
 */
export class NetworkError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'NETWORK_ERROR', context, 503);
  }
}

/**
 * Permission errors
 */
export class PermissionError extends AppError {
  constructor(permission: string) {
    super(
      `Permission denied: ${permission}`,
      'PERMISSION_ERROR',
      { permission },
      403
    );
  }
}

/**
 * Error handler utility
 */
export class ErrorHandler {
  /**
   * Handle error and return user-friendly message
   */
  static handle(error: unknown, context?: Record<string, any>): string {
    if (error instanceof AppError) {
      logger.error(error.message, { ...error.context, ...context }, error);
      return error.message;
    }

    if (error instanceof Error) {
      logger.error(error.message, context, error);
      return error.message;
    }

    const message = String(error);
    logger.error('Unknown error occurred', { error: message, ...context });
    return 'An unexpected error occurred';
  }

  /**
   * Check if error is recoverable
   */
  static isRecoverable(error: unknown): boolean {
    if (error instanceof AppError) {
      return error.code !== 'FATAL_ERROR';
    }
    return true;
  }

  /**
   * Format error for display
   */
  static formatForUser(error: unknown): string {
    if (error instanceof ValidationError) {
      return error.message;
    }

    if (error instanceof NotFoundError) {
      return 'The requested item could not be found.';
    }

    if (error instanceof DatabaseError) {
      return 'A database error occurred. Please try again.';
    }

    if (error instanceof NetworkError) {
      return 'Network error. Please check your connection.';
    }

    if (error instanceof PermissionError) {
      return 'You do not have permission to perform this action.';
    }

    if (error instanceof AppError) {
      return error.message;
    }

    return 'An unexpected error occurred. Please try again.';
  }
}

/**
 * Async error wrapper
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  errorMessage: string,
  context?: Record<string, any>
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    const message = ErrorHandler.handle(error, context);
    throw new ServiceError(errorMessage, 'operation', error as Error);
  }
}

/**
 * Sync error wrapper
 */
export function withSyncErrorHandling<T>(
  operation: () => T,
  errorMessage: string,
  context?: Record<string, any>
): T {
  try {
    return operation();
  } catch (error) {
    const message = ErrorHandler.handle(error, context);
    throw new ServiceError(errorMessage, 'operation', error as Error);
  }
}
