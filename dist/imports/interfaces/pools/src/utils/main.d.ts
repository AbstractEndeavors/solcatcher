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
import type { EnhancedPoolConfig, EnhancedPoolMetrics, PoolLike, PoolClientLike, QueryResultRow, QueryResult } from '../types.js';
export declare function loadEnhancedPoolConfig(): EnhancedPoolConfig;
export declare class EnhancedPool implements PoolLike {
    private readonly config;
    private readonly rawPool;
    private readonly adapted;
    private readonly circuitBreaker;
    private readonly semaphore;
    private statsInterval;
    constructor(config: EnhancedPoolConfig);
    query<T extends QueryResultRow = any>(sql: string, params?: any[]): Promise<QueryResult<T>>;
    connect(): Promise<PoolClientLike>;
    end(): Promise<void>;
    getMetrics(): EnhancedPoolMetrics;
    private startMonitoring;
}
export declare function getPgPool(): EnhancedPool;
export declare function shutdownPool(): Promise<void>;
