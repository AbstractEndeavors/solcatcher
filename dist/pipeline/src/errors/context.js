// src/pipeline/errors/context.ts
// ═══════════════════════════════════════════════════════════════════
// ERROR CONTEXT SYSTEM - NO MORE BLIND ERRORS
// ═══════════════════════════════════════════════════════════════════
/**
 * Error with full context about where it happened
 */
export class PipelineError extends Error {
    context;
    cause;
    constructor(message, context, cause) {
        super(message);
        this.context = context;
        this.cause = cause;
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
    toJSON() {
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
 * Error factory - creates errors with automatic context
 */
export class ErrorFactory {
    baseContext;
    constructor(baseContext) {
        this.baseContext = baseContext;
    }
    /**
     * Create validation error with field details
     */
    validation(field, value, reason, payload) {
        return new PipelineError(`Validation failed: ${field} ${reason}`, {
            ...this.baseContext,
            phase: 'validation',
            operation: 'validate_field',
            field,
            value,
            reason,
            payload,
            timestamp: Date.now(),
        });
    }
    /**
     * Create RPC error with request details
     */
    rpc(method, params, response, cause) {
        return new PipelineError(`RPC call failed: ${method}`, {
            ...this.baseContext,
            phase: 'rpc',
            operation: method,
            params,
            response,
            timestamp: Date.now(),
        }, cause);
    }
    /**
     * Create database error
     */
    database(operation, table, details, cause) {
        return new PipelineError(`Database error: ${operation} on ${table}`, {
            ...this.baseContext,
            phase: 'database',
            operation,
            table,
            details,
            timestamp: Date.now(),
        }, cause);
    }
    /**
     * Create generic error with context
     */
    generic(message, operation, details, cause) {
        return new PipelineError(message, {
            ...this.baseContext,
            operation,
            details,
            timestamp: Date.now(),
        }, cause);
    }
    /**
     * Wrap an existing error with context
     */
    wrap(error, operation, details) {
        if (error instanceof PipelineError) {
            // Already has context, just add more
            return new PipelineError(error.message, {
                ...this.baseContext,
                ...error.context,
                operation,
                details,
            }, error.cause);
        }
        return new PipelineError(error.message, {
            ...this.baseContext,
            operation,
            details,
            timestamp: Date.now(),
        }, error);
    }
}
/**
 * Create error factory for a queue
 */
export function createQueueErrorFactory(queue) {
    return new ErrorFactory({ queue });
}
/**
 * Create error factory for a handler
 */
export function createHandlerErrorFactory(queue, handler) {
    return new ErrorFactory({ queue, handler });
}
/**
 * Extract meaningful error message for logging
 */
export function formatErrorForLog(err) {
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
