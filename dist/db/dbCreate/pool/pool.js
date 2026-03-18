// src/db/dbCreate/pool_enhanced.ts
/**
 * ENHANCED POSTGRESQL POOL
 *
 * Improvements:
 * 1. Explicit environment wiring (no smart defaults betrayal)
 * 2. Circuit breaker protection
 * 3. Connection semaphore for backpressure
 * 4. Observable metrics
 * 5. Graceful degradation
 */
import { Pool } from 'pg';
import { CircuitBreakerPool } from './circuit_breaker_pool.js';
import { ConnectionSemaphore } from './connection_semaphore.js';
import { loadPostgresEnv } from '@imports';
/**
 * Load configuration from environment with EXPLICIT DEFAULTS
 * (Every value documented and overridable)
 */
export function loadEnhancedPoolConfig() {
    const env = loadPostgresEnv();
    return {
        pool: {
            host: env.host,
            port: env.port,
            database: env.database,
            user: env.user,
            password: env.password,
            ssl: env.ssl ? { rejectUnauthorized: false } : false,
            // Connection Pool Sizing
            // EXPLICIT: Based on concurrent handler analysis
            max: parseInt(process.env.DB_POOL_MAX || '16', 10),
            min: parseInt(process.env.DB_POOL_MIN || '10', 10),
            // Timeouts (all explicit, no pg defaults)
            connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT_MS || '10000', 10),
            idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT_MS || '30000', 10),
            statement_timeout: parseInt(process.env.DB_STATEMENT_TIMEOUT_MS || '30000', 10),
            // Logging
            log: process.env.DB_POOL_DEBUG === 'true'
                ? (msg) => console.log({ logType: 'debug', message: 'pg-pool', details: msg })
                : undefined,
        },
        circuitBreaker: {
            enabled: process.env.DB_CIRCUIT_BREAKER !== 'false',
            failureThreshold: parseInt(process.env.DB_CB_FAILURE_THRESHOLD || '5', 10),
            successThreshold: parseInt(process.env.DB_CB_SUCCESS_THRESHOLD || '2', 10),
            timeoutMs: parseInt(process.env.DB_CB_TIMEOUT_MS || '30000', 10),
            halfOpenRetryDelayMs: parseInt(process.env.DB_CB_RETRY_DELAY_MS || '5000', 10),
        },
        semaphore: {
            enabled: process.env.DB_SEMAPHORE !== 'false',
            // IMPORTANT: Must be <= pool.max to prevent deadlock
            maxConcurrent: parseInt(process.env.DB_MAX_CONCURRENT || '12', 10),
            queueTimeout: parseInt(process.env.DB_SEMAPHORE_TIMEOUT_MS || '15000', 10),
            enableMetrics: process.env.DB_SEMAPHORE_METRICS === 'true',
        },
        monitoring: {
            logPoolStats: process.env.DB_LOG_POOL_STATS === 'true',
            statsIntervalMs: parseInt(process.env.DB_STATS_INTERVAL_MS || '60000', 10),
        },
    };
}
// ═══════════════════════════════════════════════════════════
// ENHANCED POOL WRAPPER
// ═══════════════════════════════════════════════════════════
export class EnhancedPool {
    config;
    pool;
    circuitBreaker;
    semaphore;
    statsInterval = null;
    constructor(config) {
        this.config = config;
        // Create base pool
        this.pool = new Pool(config.pool);
        // Wrap with circuit breaker
        this.circuitBreaker = config.circuitBreaker.enabled
            ? new CircuitBreakerPool(this.pool, config.circuitBreaker)
            : null;
        // Add connection semaphore
        this.semaphore = config.semaphore.enabled
            ? new ConnectionSemaphore(config.semaphore)
            : null;
        // Setup monitoring
        if (config.monitoring.logPoolStats) {
            this.startMonitoring();
        }
        // Pool error handler
        this.pool.on('error', (err) => {
            console.log({
                logType: 'error',
                message: 'Unexpected pool error',
                error: err.message,
                stack: err.stack,
            });
        });
        // Log configuration at startup
        console.log({
            logType: 'info',
            message: 'Enhanced pool initialized',
            config: {
                maxConnections: config.pool.max,
                minConnections: config.pool.min,
                connectionTimeout: config.pool.connectionTimeoutMillis,
                circuitBreakerEnabled: config.circuitBreaker.enabled,
                semaphoreEnabled: config.semaphore.enabled,
                maxConcurrent: config.semaphore.maxConcurrent,
            },
        });
    }
    /**
     * Query with full protection stack
     */
    async query(sql, params = []) {
        const operation = async () => {
            if (this.circuitBreaker) {
                return this.circuitBreaker.query(sql, params);
            }
            return this.pool.query(sql, params);
        };
        if (this.semaphore) {
            const release = await this.semaphore.acquire();
            try {
                return await operation();
            }
            finally {
                release();
            }
        }
        return operation();
    }
    /**
     * Get pooled client with protection
     */
    async connect() {
        const operation = async () => {
            if (this.circuitBreaker) {
                return this.circuitBreaker.connect();
            }
            return this.pool.connect();
        };
        if (this.semaphore) {
            const release = await this.semaphore.acquire();
            try {
                const client = await operation();
                // Wrap release to also release semaphore
                const originalRelease = client.release.bind(client);
                client.release = () => {
                    originalRelease();
                    release();
                };
                return client;
            }
            catch (error) {
                release();
                throw error;
            }
        }
        return operation();
    }
    /**
     * Get observable metrics
     */
    getMetrics() {
        return {
            pool: {
                total: this.pool.totalCount,
                idle: this.pool.idleCount,
                waiting: this.pool.waitingCount,
            },
            circuitBreaker: this.circuitBreaker?.getState(),
            semaphore: this.semaphore?.getMetrics(),
        };
    }
    /**
     * Graceful shutdown
     */
    async end() {
        if (this.statsInterval) {
            clearInterval(this.statsInterval);
        }
        await this.pool.end();
    }
    // ═══════════════════════════════════════════════════════════
    // PRIVATE: Monitoring
    // ═══════════════════════════════════════════════════════════
    startMonitoring() {
        this.statsInterval = setInterval(() => {
            const metrics = this.getMetrics();
            console.log({
                logType: 'info',
                message: 'Pool statistics',
                metrics,
            });
            // Warn on saturation
            if (metrics.pool.total >= (this.config.pool.max || 10) &&
                metrics.pool.waiting > 0) {
                console.log({
                    logType: 'warn',
                    message: 'Pool saturation detected',
                    waiting: metrics.pool.waiting,
                    maxConnections: this.config.pool.max,
                });
            }
        }, this.config.monitoring.statsIntervalMs);
    }
}
// ═══════════════════════════════════════════════════════════
// SINGLETON MANAGEMENT (Explicit, Observable)
// ═══════════════════════════════════════════════════════════
let enhancedPool = null;
export function getEnhancedPool() {
    if (!enhancedPool) {
        const config = loadEnhancedPoolConfig();
        enhancedPool = new EnhancedPool(config);
    }
    return enhancedPool;
}
export async function shutdownPool() {
    if (enhancedPool) {
        await enhancedPool.end();
        enhancedPool = null;
    }
}
