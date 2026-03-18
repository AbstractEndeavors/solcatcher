// src/db/dbCreate/connection_semaphore.ts
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
export class ConnectionSemaphore {
    config;
    available;
    queue = [];
    metrics = {
        acquired: 0,
        waiting: 0,
        totalAcquired: 0,
        totalReleased: 0,
        totalTimeout: 0,
        currentConcurrency: 0,
    };
    constructor(config) {
        this.config = config;
        this.available = config.maxConcurrent;
    }
    /**
     * Acquire permit (waits if none available)
     */
    async acquire() {
        if (this.available > 0) {
            this.available--;
            this.recordAcquisition();
            return this.createReleaser();
        }
        // Queue and wait
        return new Promise((resolve, reject) => {
            const timeoutHandle = setTimeout(() => {
                this.removeFromQueue(request);
                this.metrics.totalTimeout++;
                reject(new Error(`Semaphore timeout: waited ${this.config.queueTimeout}ms, ` +
                    `queue length ${this.queue.length}`));
            }, this.config.queueTimeout);
            const request = {
                resolve: () => {
                    clearTimeout(timeoutHandle);
                    this.recordAcquisition();
                    resolve(this.createReleaser());
                },
                reject,
                enqueuedAt: Date.now(),
                timeoutHandle,
            };
            this.queue.push(request);
            this.metrics.waiting = this.queue.length;
            if (this.config.enableMetrics && this.queue.length % 10 === 0) {
                console.log({
                    logType: 'warn',
                    message: 'Semaphore queue building up',
                    queueLength: this.queue.length,
                    maxConcurrent: this.config.maxConcurrent,
                });
            }
        });
    }
    /**
     * Try acquire without waiting
     */
    tryAcquire() {
        if (this.available > 0) {
            this.available--;
            this.recordAcquisition();
            return this.createReleaser();
        }
        return null;
    }
    /**
     * Get current metrics
     */
    getMetrics() {
        return { ...this.metrics };
    }
    /**
     * Get queue status
     */
    getQueueInfo() {
        const oldestWaitMs = this.queue.length > 0
            ? Date.now() - this.queue[0].enqueuedAt
            : null;
        return {
            waiting: this.queue.length,
            available: this.available,
            oldestWaitMs,
        };
    }
    // ═══════════════════════════════════════════════════════════
    // PRIVATE: Release Management
    // ═══════════════════════════════════════════════════════════
    createReleaser() {
        let released = false;
        return () => {
            if (released) {
                console.log({
                    logType: 'warn',
                    message: 'Semaphore releaser called multiple times',
                });
                return;
            }
            released = true;
            this.release();
        };
    }
    release() {
        this.metrics.totalReleased++;
        this.metrics.currentConcurrency--;
        // Serve next queued request
        if (this.queue.length > 0) {
            const next = this.queue.shift();
            this.metrics.waiting = this.queue.length;
            next.resolve();
        }
        else {
            this.available++;
        }
    }
    removeFromQueue(request) {
        const index = this.queue.indexOf(request);
        if (index !== -1) {
            this.queue.splice(index, 1);
            this.metrics.waiting = this.queue.length;
        }
    }
    recordAcquisition() {
        this.metrics.totalAcquired++;
        this.metrics.currentConcurrency++;
        this.metrics.acquired = this.metrics.currentConcurrency;
    }
}
/**
 * Wrapper for database operations with semaphore
 */
export async function withSemaphore(semaphore, operation) {
    const release = await semaphore.acquire();
    try {
        return await operation();
    }
    finally {
        release();
    }
}
