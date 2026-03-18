import type { QueueName } from '../queues/definitions.js';
/**
 * Error with full context about where it happened
 */
export declare class PipelineError extends Error {
    readonly context: ErrorContext;
    readonly cause?: Error | undefined;
    constructor(message: string, context: ErrorContext, cause?: Error | undefined);
    toJSON(): object;
}
/**
 * Context about where an error occurred
 */
export interface ErrorContext {
    queue?: QueueName;
    handler?: string;
    phase?: string;
    file?: string;
    function?: string;
    payload?: unknown;
    operation?: string;
    timestamp?: number;
    [key: string]: unknown;
}
/**
 * Error factory - creates errors with automatic context
 */
export declare class ErrorFactory {
    private readonly baseContext;
    constructor(baseContext: Partial<ErrorContext>);
    /**
     * Create validation error with field details
     */
    validation(field: string, value: unknown, reason: string, payload?: unknown): PipelineError;
    /**
     * Create RPC error with request details
     */
    rpc(method: string, params: unknown, response: unknown, cause?: Error): PipelineError;
    /**
     * Create database error
     */
    database(operation: string, table: string, details: unknown, cause?: Error): PipelineError;
    /**
     * Create generic error with context
     */
    generic(message: string, operation: string, details?: unknown, cause?: Error): PipelineError;
    /**
     * Wrap an existing error with context
     */
    wrap(error: Error, operation: string, details?: unknown): PipelineError;
}
/**
 * Create error factory for a queue
 */
export declare function createQueueErrorFactory(queue: QueueName): ErrorFactory;
/**
 * Create error factory for a handler
 */
export declare function createHandlerErrorFactory(queue: QueueName, handler: string): ErrorFactory;
/**
 * Extract meaningful error message for logging
 */
export declare function formatErrorForLog(err: unknown): {
    message: string;
    stack?: string;
    context?: ErrorContext;
    cause?: {
        message: string;
        stack?: string;
    };
};
