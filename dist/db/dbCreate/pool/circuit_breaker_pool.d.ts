import type { Pool, QueryResult, QueryResultRow } from 'pg';
type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';
interface CircuitBreakerConfig {
    failureThreshold: number;
    successThreshold: number;
    timeout: number;
    retryDelay: number;
}
export declare class CircuitBreakerPool {
    private pool;
    private state;
    private failureCount;
    private successCount;
    private nextRetry;
    private config;
    private recentFailures;
    constructor(pool: Pool, config?: Partial<CircuitBreakerConfig>);
    query<T extends QueryResultRow = any>(sql: string, params?: any[]): Promise<QueryResult<T>>;
    private onSuccess;
    private onFailure;
    private transitionTo;
    end(): Promise<void>;
    get currentState(): CircuitState;
}
export {};
