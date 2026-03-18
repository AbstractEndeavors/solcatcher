import type { QueryResult, QueryResultRow, PoolConfig } from 'pg';
export { QueryResult, QueryResultRow };
export interface PoolClientLike {
    query<T extends QueryResultRow = any>(sql: string, params?: any[]): Promise<QueryResult<T>>;
    release(): void;
}
export interface PoolLike {
    query<T extends QueryResultRow = any>(sql: string, params?: any[]): Promise<QueryResult<T>>;
    connect(): Promise<PoolClientLike>;
    end(): Promise<void>;
}
export interface SemaphoreConfig {
    maxConcurrent: number;
    queueTimeout: number;
    enableMetrics: boolean;
}
export interface SemaphoreMetrics {
    acquired: number;
    waiting: number;
    totalAcquired: number;
    totalReleased: number;
    totalTimeout: number;
    currentConcurrency: number;
}
export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';
export interface CircuitBreakerConfig {
    failureThreshold: number;
    successThreshold: number;
    timeout: number;
    retryDelay: number;
}
export interface FailureRecord {
    timestamp: number;
    error: string;
    errorCode?: string;
    errorStack?: string;
}
export interface EnhancedPoolConfig {
    pool: PoolConfig;
    circuitBreaker: {
        enabled: boolean;
        failureThreshold: number;
        successThreshold: number;
        timeoutMs: number;
        halfOpenRetryDelayMs: number;
    };
    semaphore: {
        enabled: boolean;
        maxConcurrent: number;
        queueTimeout: number;
        enableMetrics: boolean;
    };
    monitoring: {
        logPoolStats: boolean;
        statsIntervalMs: number;
    };
}
export interface EnhancedPoolMetrics {
    pool: {
        total: number;
        idle: number;
        waiting: number;
    };
    circuitBreaker?: CircuitState;
    semaphore?: SemaphoreMetrics;
}
export interface WaitingRequest {
    resolve: () => void;
    reject: (err: Error) => void;
    enqueuedAt: number;
    timeoutHandle: NodeJS.Timeout;
}
