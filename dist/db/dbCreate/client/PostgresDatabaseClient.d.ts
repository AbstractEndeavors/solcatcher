import type { QueryOptions, DatabaseClient, DatabaseConfig, TransactionCallback, QueryResult, QueryResultRow, PoolLike } from '@imports';
export declare const FILE_LOCATION = "src/db/dbCreate/client/PostgresDatabaseClient.ts";
export declare class PostgresDatabaseClient implements DatabaseClient {
    private readonly pool;
    private readonly retryConfig;
    constructor(pool: PoolLike, config: DatabaseConfig);
    /**
     * Execute a query with automatic retry on transient failures
     */
    query<T extends QueryResultRow = any>(sql: string, params?: any[], options?: QueryOptions): Promise<QueryResult<T>>;
    transaction<T>(callback: TransactionCallback<T>): Promise<T>;
    end(): Promise<void>;
    private shouldRetryError;
    private calculateRetryDelay;
    private sleep;
}
