/**
 * Connection Semaphore
 *
 * Explicit concurrency control for database operations:
 * - Limits concurrent connection acquisitions
 * - Provides queue-based waiting (FIFO)
 * - Prevents pool exhaustion
 * - Enables graceful degradation under load
 *
 * Follows principles:
 * - Queues over callbacks
 * - Explicit limits over "smart defaults"
 * - Observable state for debugging
 */
export interface SemaphoreConfig {
    maxConcurrent: number;
    queueTimeout: number;
    enableMetrics: boolean;
}
interface SemaphoreMetrics {
    acquired: number;
    waiting: number;
    totalAcquired: number;
    totalReleased: number;
    totalTimeout: number;
    currentConcurrency: number;
}
export declare class ConnectionSemaphore {
    private readonly config;
    private available;
    private queue;
    private metrics;
    constructor(config: SemaphoreConfig);
    /**
     * Acquire permit (waits if none available)
     */
    acquire(): Promise<() => void>;
    /**
     * Try acquire without waiting
     */
    tryAcquire(): (() => void) | null;
    /**
     * Get current metrics
     */
    getMetrics(): SemaphoreMetrics;
    /**
     * Get queue status
     */
    getQueueInfo(): {
        waiting: number;
        available: number;
        oldestWaitMs: number | null;
    };
    private createReleaser;
    private release;
    private removeFromQueue;
    private recordAcquisition;
}
/**
 * Wrapper for database operations with semaphore
 */
export declare function withSemaphore<T>(semaphore: ConnectionSemaphore, operation: () => Promise<T>): Promise<T>;
export {};
