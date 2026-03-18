/**
 * RATE LIMITER SERVICE (REFACTORED)
 *
 * Database-backed rate limiting with in-memory URL selection.
 * URL selection is FAST and SYNCHRONOUS - no DB queries in hot path.
 */
import { type DatabaseClient, type UrlDict } from '@imports';
export interface RateLimiterServiceConfig {
    db: DatabaseClient;
    urls: UrlDict[];
    fallbackUrl: UrlDict;
    circuitBreakerThreshold?: number;
    circuitBreakerDuration?: number;
}
export declare class RateLimiterService {
    private readonly repo;
    private readonly urlRegistry;
    private readonly commitment;
    readonly urls: UrlDict[];
    readonly fallbackUrl: UrlDict;
    readonly fallbackOnLimit: boolean;
    private readonly fallbackNetloc;
    private urlRegistryDb;
    private variantsMap;
    private variantsLookup;
    private lastMethod;
    private lastUrl;
    private metrics;
    constructor(config: RateLimiterServiceConfig);
    start(): Promise<void>;
    private registerUrls;
    private loadState;
    saveState(): Promise<void>;
    /**
     * Get best available URL for the given method
     * FAST, SYNCHRONOUS, NO DATABASE QUERIES
     */
    getUrl(method: string, forceFallback?: boolean): string;
    getFallbackUrl(method?: any): string;
    /**
     * Get URL health status for monitoring
     */
    getUrlHealth(): any;
    private resolveNetloc;
    private ensureMethodLimits;
    getStateRateLimit(method: string, identifier: string, limitType: 'rate_limit' | 'rps_limit' | 'retry_after'): Promise<number>;
    processHeaders(response: Response, method: string, identifier: string): Promise<[number, number] | [null, null]>;
    setCooldown(netloc: string | null, method: string | null, add: number | false): Promise<number | false>;
    getCooldownForMethod(identifier: string, method: string): Promise<number | false>;
    addData(identifier: string, method: string, dataSize: number): Promise<void>;
    /**
     * Process response and update both registry and database
     * Registry update is FIRST and FAST
     * Database updates are ASYNC and don't block
     */
    private processResponseAndUpdateRegistry;
    fetchRpc(options: {
        method: string;
        params?: unknown[];
        id?: string | number;
        jsonrpc?: string | number;
        headers?: Record<string, string>;
    }, forceFallback?: boolean): Promise<any>;
}
export declare function createRateLimiterService(config: RateLimiterServiceConfig): Promise<RateLimiterService>;
