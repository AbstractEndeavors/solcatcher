import type { PoolLike, CircuitState, CircuitBreakerConfig, QueryResult, QueryResultRow } from '../../types.js';
export declare class CircuitBreakerPool {
    private readonly pool;
    private state;
    private failureCount;
    private successCount;
    private nextRetry;
    private readonly config;
    private readonly recentFailures;
    constructor(pool: PoolLike, config?: Partial<CircuitBreakerConfig>);
    query<T extends QueryResultRow = any>(sql: string, params?: any[]): Promise<QueryResult<T>>;
    connect(): Promise<import("../../types.js").PoolClientLike>;
    end(): Promise<void>;
    getState(): CircuitState;
    private onSuccess;
    private onFailure;
    private transitionTo;
}
