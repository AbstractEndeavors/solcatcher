// src/pipeline/errors/context.ts
// ═══════════════════════════════════════════════════════════════════
// ERROR CONTEXT SYSTEM - NO MORE BLIND ERRORS
// ═══════════════════════════════════════════════════════════════════

import type { QueueName } from './imports.js';

/**
 * Error with full context about where it happened
 */
export class PipelineError extends Error {
  constructor(
    message: string,
    public readonly context: ErrorContext,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'PipelineError';
    
    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, PipelineError);
    }
    
    // Append cause stack if present
    if (cause?.stack) {
      this.stack = `${this.stack}\n\nCaused by:\n${cause.stack}`;
    }
  }

  toJSON(): object {
    return {
      name: this.name,
      message: this.message,
      context: this.context,
      stack: this.stack,
      cause: this.cause ? {
        message: this.cause.message,
        stack: this.cause.stack,
      } : undefined,
    };
  }
}

/**
 * Context about where an error occurred
 */
export interface ErrorContext {
  // Location
  queue?: QueueName;
  handler?: string;
  phase?: string;
  file?: string;
  function?: string;
  
  // Data
  payload?: unknown;
  operation?: string;
  
  // Metadata
  timestamp?: number;
  [key: string]: unknown;
}

/**
 * Error factory - creates errors with automatic context
 */
export class ErrorFactory {
  constructor(private readonly baseContext: Partial<ErrorContext>) {}

  /**
   * Create validation error with field details
   */
  validation(
    field: string,
    value: unknown,
    reason: string,
    payload?: unknown
  ): PipelineError {
    return new PipelineError(
      `Validation failed: ${field} ${reason}`,
      {
        ...this.baseContext,
        phase: 'validation',
        operation: 'validate_field',
        field,
        value,
        reason,
        payload,
        timestamp: Date.now(),
      }
    );
  }

  /**
   * Create RPC error with request details
   */
  rpc(
    method: string,
    params: unknown,
    response: unknown,
    cause?: Error
  ): PipelineError {
    return new PipelineError(
      `RPC call failed: ${method}`,
      {
        ...this.baseContext,
        phase: 'rpc',
        operation: method,
        params,
        response,
        timestamp: Date.now(),
      },
      cause
    );
  }

  /**
   * Create database error
   */
  database(
    operation: string,
    table: string,
    details: unknown,
    cause?: Error
  ): PipelineError {
    return new PipelineError(
      `Database error: ${operation} on ${table}`,
      {
        ...this.baseContext,
        phase: 'database',
        operation,
        table,
        details:JSON.stringify(details),
        timestamp: Date.now(),
      },
      cause
    );
  }

  /**
   * Create generic error with context
   */
  generic(
    message: string,
    operation: string,
    details?: unknown,
    cause?: Error
  ): PipelineError {
    return new PipelineError(
      message,
      {
        ...this.baseContext,
        operation,
        details:JSON.stringify(details),
        timestamp: Date.now(),
      },
      cause
    );
  }

  /**
   * Wrap an existing error with context
   */
  wrap(
    error: Error,
    operation: string,
    details?: unknown
  ): PipelineError {
    if (error instanceof PipelineError) {
      // Already has context, just add more
      return new PipelineError(
        error.message,
        {
          ...this.baseContext,
          ...error.context,
          operation,
          details:JSON.stringify(details),
        },
        error.cause
      );
    }

    return new PipelineError(
      error.message,
      {
        ...this.baseContext,
        operation,
        details:JSON.stringify(details),
        timestamp: Date.now(),
      },
      error
    );
  }
}

/**
 * Create error factory for a queue
 */
export function createQueueErrorFactory(queue: QueueName): ErrorFactory {
  return new ErrorFactory({ queue });
}

/**
 * Create error factory for a handler
 */
export function createHandlerErrorFactory(
  queue: QueueName,
  handler: string
): ErrorFactory {
  return new ErrorFactory({ queue, handler });
}

/**
 * Extract meaningful error message for logging
 */
export function formatErrorForLog(err: unknown): {
  message: string;
  stack?: string;
  context?: ErrorContext;
  cause?: { message: string; stack?: string };
} {
  if (err instanceof PipelineError) {
    return {
      message: err.message,
      stack: err.stack,
      context: err.context,
      cause: err.cause ? {
        message: err.cause.message,
        stack: err.cause.stack,
      } : undefined,
    };
  }

  if (err instanceof Error) {
    return {
      message: err.message,
      stack: err.stack,
    };
  }

  return {
    message: String(err),
  };
}
