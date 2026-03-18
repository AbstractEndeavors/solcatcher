// src/imports/interfaces/pools/src/utils/main.ts
/**
 * ENHANCED POSTGRESQL POOL
 *
 * Fixes from previous version:
 *   - adaptPgPool now explicitly imported (was called but never imported)
 *   - raw Pool kept separately for stats/events; adapted PoolLike used for queries
 *   - EnhancedPool implements PoolLike — no more silent `any` contract
 *   - connect() typed correctly — returns PoolClientLike, releases semaphore on error
 *   - getPgPool() return type narrowed to EnhancedPool (which satisfies PoolLike)
 *
 * Pattern: Explicit environment wiring — every dependency visible in constructor.
 */

import type {
  EnhancedPoolConfig,
  EnhancedPoolMetrics,
  PoolLike,
  PoolClientLike,
  QueryResultRow,
  QueryResult,
} from '../types.js';
import { loadPostgresEnv } from './../imports.js';
import { adaptPgPool } from './pgAdapter.js';           // ← was missing
import { CircuitBreakerPool } from './circuit_breaker/index.js';
import { ConnectionSemaphore } from './semaphore/index.js';
import { Pool } from 'pg';


// ── Config loader ──────────────────────────────────────────────────────────────

export function loadEnhancedPoolConfig(): EnhancedPoolConfig {
  const env = loadPostgresEnv();

  return {
    pool: {
      host:     env.host,
      port:     env.port,
      database: env.database,
      user:     env.user,
      password: env.password,
      ssl:      env.ssl ? { rejectUnauthorized: false } : false,

      max: parseInt(process.env.DB_POOL_MAX || '16', 10),
      min: parseInt(process.env.DB_POOL_MIN || '10', 10),

      connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT_MS  || '10000', 10),
      idleTimeoutMillis:       parseInt(process.env.DB_IDLE_TIMEOUT_MS        || '30000', 10),
      statement_timeout:       parseInt(process.env.DB_STATEMENT_TIMEOUT_MS   || '30000', 10),

      log: process.env.DB_POOL_DEBUG === 'true'
        ? (msg) => console.log({ logType: 'debug', message: 'pg-pool', details: msg })
        : undefined,
    },

    circuitBreaker: {
      enabled:              process.env.DB_CIRCUIT_BREAKER !== 'false',
      failureThreshold:     parseInt(process.env.DB_CB_FAILURE_THRESHOLD  || '5',    10),
      successThreshold:     parseInt(process.env.DB_CB_SUCCESS_THRESHOLD  || '2',    10),
      timeoutMs:            parseInt(process.env.DB_CB_TIMEOUT_MS         || '30000', 10),
      halfOpenRetryDelayMs: parseInt(process.env.DB_CB_RETRY_DELAY_MS    || '5000',  10),
    },

    semaphore: {
      enabled:       process.env.DB_SEMAPHORE !== 'false',
      maxConcurrent: parseInt(process.env.DB_MAX_CONCURRENT       || '12',    10),
      queueTimeout:  parseInt(process.env.DB_SEMAPHORE_TIMEOUT_MS || '15000', 10),
      enableMetrics: process.env.DB_SEMAPHORE_METRICS === 'true',
    },

    monitoring: {
      logPoolStats:    process.env.DB_LOG_POOL_STATS === 'true',
      statsIntervalMs: parseInt(process.env.DB_STATS_INTERVAL_MS || '60000', 10),
    },
  };
}


// ── EnhancedPool ───────────────────────────────────────────────────────────────

export class EnhancedPool implements PoolLike {
  // rawPool: kept for pg-native stats (totalCount / idleCount / waitingCount)
  // and for the 'error' event listener — these don't exist on PoolLike.
  private readonly rawPool:        Pool;
  // adapted: the PoolLike surface used for all queries / connects.
  private readonly adapted:        PoolLike;
  private readonly circuitBreaker: CircuitBreakerPool | null;
  private readonly semaphore:      ConnectionSemaphore | null;
  private statsInterval:           NodeJS.Timeout | null = null;

  constructor(private readonly config: EnhancedPoolConfig) {
    this.rawPool = new Pool(config.pool);
    this.adapted = adaptPgPool(this.rawPool);            // PoolLike adapter

    this.circuitBreaker = config.circuitBreaker.enabled
      ? new CircuitBreakerPool(this.adapted, config.circuitBreaker)
      : null;

    this.semaphore = config.semaphore.enabled
      ? new ConnectionSemaphore(config.semaphore)
      : null;

    if (config.monitoring.logPoolStats) {
      this.startMonitoring();
    }

    // Raw pool error handler — rawPool has `.on()`, PoolLike does not
    this.rawPool.on('error', (err) => {
      console.log({
        logType:  'error',
        message:  'Unexpected pool error',
        error:    err.message,
        stack:    err.stack,
      });
    });

    console.log({
      logType: 'info',
      message: 'Enhanced pool initialized',
      config: {
        maxConnections:      config.pool.max,
        minConnections:      config.pool.min,
        connectionTimeout:   config.pool.connectionTimeoutMillis,
        circuitBreakerEnabled: config.circuitBreaker.enabled,
        semaphoreEnabled:    config.semaphore.enabled,
        maxConcurrent:       config.semaphore.maxConcurrent,
      },
    });
  }

  // ── PoolLike: query ──────────────────────────────────────────────────────────

  async query<T extends QueryResultRow = any>(
    sql: string,
    params: any[] = []
  ): Promise<QueryResult<T>> {
    const run = (): Promise<QueryResult<T>> =>
      this.circuitBreaker
        ? this.circuitBreaker.query<T>(sql, params)
        : this.adapted.query<T>(sql, params);

    if (!this.semaphore) return run();

    const release = await this.semaphore.acquire();
    try {
      return await run();
    } finally {
      release();
    }
  }

  // ── PoolLike: connect ────────────────────────────────────────────────────────

  async connect(): Promise<PoolClientLike> {
    const getClient = (): Promise<PoolClientLike> =>
      this.circuitBreaker
        ? this.circuitBreaker.connect()
        : this.adapted.connect();

    if (!this.semaphore) return getClient();

    const release = await this.semaphore.acquire();
    try {
      const client = await getClient();
      // Wrap release so the semaphore slot is freed when the caller is done
      const originalRelease = client.release.bind(client);
      client.release = () => {
        originalRelease();
        release();
      };
      return client;
    } catch (err) {
      // Caller never got a client — release the semaphore slot immediately
      release();
      throw err;
    }
  }

  // ── PoolLike: end ────────────────────────────────────────────────────────────

  async end(): Promise<void> {
    if (this.statsInterval) {
      clearInterval(this.statsInterval);
      this.statsInterval = null;
    }
    await this.rawPool.end();
  }

  // ── Metrics ──────────────────────────────────────────────────────────────────

  getMetrics(): EnhancedPoolMetrics {
    return {
      pool: {
        // rawPool carries the pg stats — adapted/PoolLike does not
        total:   this.rawPool.totalCount,
        idle:    this.rawPool.idleCount,
        waiting: this.rawPool.waitingCount,
      },
      circuitBreaker: this.circuitBreaker?.getState(),
      semaphore:      this.semaphore?.getMetrics(),
    };
  }

  // ── Private: monitoring ──────────────────────────────────────────────────────

  private startMonitoring(): void {
    this.statsInterval = setInterval(() => {
      const metrics = this.getMetrics();
      console.log({ logType: 'info', message: 'Pool statistics', metrics });

      if (
        metrics.pool.total >= (this.config.pool.max ?? 10) &&
        metrics.pool.waiting > 0
      ) {
        console.log({
          logType:        'warn',
          message:        'Pool saturation detected',
          waiting:        metrics.pool.waiting,
          maxConnections: this.config.pool.max,
        });
      }
    }, this.config.monitoring.statsIntervalMs);
  }
}


// ── Singleton ─────────────────────────────────────────────────────────────────

let enhancedPool: EnhancedPool | null = null;

export function getPgPool(): EnhancedPool {
  if (!enhancedPool) {
    enhancedPool = new EnhancedPool(loadEnhancedPoolConfig());
  }
  return enhancedPool;
}

export async function shutdownPool(): Promise<void> {
  if (enhancedPool) {
    await enhancedPool.end();
    enhancedPool = null;
  }
}