import type {QueryOptions,
    DatabaseClient,
  DatabaseConfig,
  TransactionCallback,
  RetryConfig,
  QueryResult, QueryResultRow,PoolLike
 } from '@imports';

export const FILE_LOCATION = "src/db/dbCreate/client/PostgresDatabaseClient.ts";



export class PostgresDatabaseClient implements DatabaseClient {
  private readonly pool: PoolLike;
  private readonly retryConfig: RetryConfig;

  constructor(pool: PoolLike, config: DatabaseConfig){
    this.pool = pool;
    this.retryConfig = config.retryConfig;

    // Only attach error handler for raw Pool (EnhancedPool handles this internally)
    if ('on' in pool && typeof pool.on === 'function') {
      pool.on('error', (err: any) => {
        console.log({
          message: 'Unexpected pool error',
          details: err.message,
          logType: 'error',
          file_location: FILE_LOCATION,
        });
      });
    }
  }


  /**
   * Execute a query with automatic retry on transient failures
   */
  async query<T extends QueryResultRow = any>(
    sql: string,
    params: any[] = [],
    options: QueryOptions = {}
  ): Promise<QueryResult<T>> {
    const maxRetries = options.retries ?? this.retryConfig.maxRetries;
    let attempt = 0;

    while (attempt <= maxRetries) {
      try {
        const result = await this.pool.query<T>(sql, params);

        if (options.throwOnEmpty && result.rows.length === 0) {
          throw new Error('Query returned no rows');
        }

        return result;
      } catch (error: any) {
        if (!this.shouldRetryError(error, attempt, maxRetries)) {
          throw error;
        }

        attempt++;
        await this.sleep(this.calculateRetryDelay(attempt));
      }
    }

    throw new Error('Max retries exceeded');
  }

async transaction<T>(callback: TransactionCallback<T>): Promise<T> {
  const client = await this.pool.connect();

  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}


  async end(): Promise<void> {
    // ⚠️ Usually you should NOT call this in long-lived services
    await this.pool.end();
  }

  // ────────────────────────────────────────────────
  // Private helpers
  // ────────────────────────────────────────────────

  private shouldRetryError(
    error: any,
    attempt: number,
    maxRetries: number
  ): boolean {
    if (attempt >= maxRetries) return false;

    if (error.code && this.retryConfig.retryableErrors.includes(error.code)) {
      return true;
    }

    if (error.message?.includes('Connection terminated')) {
      return true;
    }

    return false;
  }

  private calculateRetryDelay(attempt: number): number {
    const exponentialDelay = Math.min(
      this.retryConfig.baseDelayMs * Math.pow(2, attempt - 1),
      this.retryConfig.maxDelayMs
    );

    const jitter = exponentialDelay * 0.25 * (Math.random() - 0.5);
    return Math.floor(exponentialDelay + jitter);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
