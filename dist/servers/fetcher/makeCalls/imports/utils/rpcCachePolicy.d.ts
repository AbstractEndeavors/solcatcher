/**
 * RPC Cache Policy Registry
 *
 * Categories:
 *   - Dynamic:    Never cache (state changes between calls)
 *   - Static:     Cache forever (genesis hash, version)
 *   - Immutable:  Cache forever once fetched (historical blocks/txns)
 *   - QuasiStatic: Short TTL (epoch info, leader schedule)
 *   - CommitmentDependent: TTL varies by commitment level
 */
import type { Commitment } from "./../src/index.js";
export type CacheCategory = "dynamic" | "static" | "immutable" | "quasi_static" | "commitment_dependent";
export interface CachePolicy {
    category: CacheCategory;
    ttlMs: number | null;
}
export declare function getCachePolicy(method: string, commitment?: Commitment): CachePolicy;
export declare function shouldCache(method: string, commitment?: Commitment): boolean;
export declare function getCategory(method: string): CacheCategory;
export declare class RpcCache {
    private readonly cache;
    private readonly maxSize;
    constructor(maxSize?: number);
    /**
     * Build cache key from method + params
     */
    static buildKey(method: string, params: unknown[]): string;
    /**
     * Get cached value if valid
     */
    get<T>(key: string): T | null;
    /**
     * Set value with policy-driven TTL
     */
    set<T>(key: string, value: T, method: string, commitment?: any): void;
    /**
     * Check if we should fetch or use cache
     */
    shouldFetch(key: string): boolean;
    /**
     * Clear all or by prefix
     */
    clear(prefix?: string): void;
    /**
     * Invalidate by method (e.g., after a write operation)
     */
    invalidateMethod(method: string): void;
    /**
     * Stats for debugging
     */
    stats(): {
        size: number;
        methods: Record<string, number>;
    };
}
