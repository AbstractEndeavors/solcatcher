import type {
  PoolLike,
  CircuitState,
  CircuitBreakerConfig,
  FailureRecord,
  QueryResult,
  QueryResultRow
} from '../../types.js';

export class CircuitBreakerPool {
  private state: CircuitState = 'CLOSED';
  private failureCount = 0;
  private successCount = 0;
  private nextRetry = 0;
  private readonly config: CircuitBreakerConfig;
  private readonly recentFailures: FailureRecord[] = [];

  constructor(
    private readonly pool: PoolLike,
    config: Partial<CircuitBreakerConfig> = {}
  ) {
    this.config = {
      failureThreshold: config.failureThreshold ?? 5,
      successThreshold: config.successThreshold ?? 2,
      timeout: config.timeout ?? 30_000,
      retryDelay: config.retryDelay ?? 5_000,
    };
  }

  async query<T extends QueryResultRow = any>(
    sql: string,
    params: any[] = []
  ): Promise<QueryResult<T>> {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextRetry) {
        throw new Error(
          `Circuit breaker OPEN: database unavailable (${this.failureCount} failures)`
        );
      }
      this.transitionTo('HALF_OPEN');
    }

    try {
      const result = await this.pool.query<T>(sql, params);
      this.onSuccess();
      return result;
    } catch (err: any) {
      this.onFailure(err);
      throw err;
    }
  }

  async connect() {
    return this.pool.connect();
  }

  async end(): Promise<void> {
    return this.pool.end();
  }

  getState(): CircuitState {
    return this.state;
  }

  /* ───────────── internals ───────────── */

  private onSuccess() {
    this.failureCount = 0;

    if (this.state === 'HALF_OPEN') {
      this.successCount++;
      if (this.successCount >= this.config.successThreshold) {
        this.successCount = 0;
        this.transitionTo('CLOSED');
      }
    }
  }

  private onFailure(error: any) {
    const record: FailureRecord = {
      timestamp: Date.now(),
      error: error?.message ?? String(error),
      errorCode: error?.code,
      errorStack: error?.stack,
    };

    this.recentFailures.push(record);
    if (this.recentFailures.length > 10) {
      this.recentFailures.shift();
    }

    this.successCount = 0;
    this.failureCount++;

    if (
      this.failureCount >= this.config.failureThreshold &&
      this.state !== 'OPEN'
    ) {
      this.transitionTo('OPEN');
      this.nextRetry = Date.now() + this.config.retryDelay;
    }
  }

  private transitionTo(next: CircuitState) {
    this.state = next;
  }
}