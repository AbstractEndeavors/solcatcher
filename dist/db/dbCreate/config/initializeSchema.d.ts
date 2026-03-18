import type { PoolLike } from '@imports';
export declare function initializeSchema(pool?: PoolLike): Promise<void>;
export declare function initRateLimiter(): Promise<import("@repositories/ratelimiter/index.js").RateLimiterService>;
