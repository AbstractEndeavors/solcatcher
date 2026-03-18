import type { SemaphoreMetrics } from "./../types.js";
import { CircuitBreakerPool } from './circuit_breaker/index.js';
export interface EnhancedPoolMetrics {
    pool: {
        total: number;
        idle: number;
        waiting: number;
    };
    circuitBreaker?: ReturnType<CircuitBreakerPool['getState']>;
    semaphore?: SemaphoreMetrics;
}
