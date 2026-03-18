import type { TransactionCallback, PoolConfig, QueryResult, QueryResultRow } from './imports.js';
export interface RetryConfig {
    maxRetries: number;
    baseDelayMs: number;
    maxDelayMs: number;
    retryableErrors: string[];
}
export interface DatabaseConfig {
    pool: PoolConfig;
    retryConfig: RetryConfig;
    connectionLimits: ConnectionLimits;
}
export interface ConnectionLimits {
    maxConnections: number;
    idleTimeoutMs: number;
    connectionTimeoutMs: number;
    statementTimeoutMs: number;
}
export interface DatabaseModule {
    client: DatabaseClient;
    repos: any;
}
export interface DatabaseApp {
    db: DatabaseClient;
    repos: any;
    initialize(): Promise<void>;
    shutdown(): Promise<void>;
    healthCheck(): Promise<{
        healthy: boolean;
        uptime: number;
    }>;
}
export interface DatabaseClient {
    query<T extends QueryResultRow = any>(sql: string, params?: any[], options?: any): Promise<QueryResult<T>>;
    transaction<T>(callback: TransactionCallback<T>): Promise<T>;
    end(): Promise<void>;
}
export type { QueryResult, QueryResultRow };
