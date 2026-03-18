/**
 * BATCH BUFFER (Queue-based)
 *
 * Principle: Queues over callbacks
 *
 * Instead of callback-based flushing, uses an async queue pattern
 * that consumers can process explicitly.
 */
import { EventEmitter } from 'events';
export const DEFAULT_BATCH_CONFIG = {
    batchSize: 100,
    maxDelayMs: 50,
    hardCap: 500,
};
/**
 * Queue-based batch buffer
 *
 * Pattern:
 * - Items added to queue
 * - Flusher polls queue on interval
 * - Consumer explicitly processes batches
 *
 * No hidden callbacks - explicit control flow
 */
export class BatchQueue extends EventEmitter {
    config;
    queue = [];
    processing = false;
    flushTimer = null;
    constructor(config = DEFAULT_BATCH_CONFIG) {
        super();
        this.config = config;
    }
    // ──────────────────────────────────────────────────────
    // PUBLIC API
    // ──────────────────────────────────────────────────────
    /** Add item to queue */
    enqueue(item) {
        this.queue.push(item);
        // Hard cap - flush immediately
        if (this.queue.length >= this.config.hardCap) {
            this.emit('hardcap-reached');
            this.scheduleFlush(0); // immediate
            return;
        }
        // Schedule delayed flush if not already scheduled
        if (!this.flushTimer) {
            this.scheduleFlush(this.config.maxDelayMs);
        }
    }
    /** Add multiple items */
    enqueueBatch(items) {
        items.forEach(item => this.enqueue(item));
    }
    /** Get next batch without removing from queue */
    peek(size = this.config.batchSize) {
        return this.queue.slice(0, size);
    }
    /** Take next batch from queue (removes items) */
    take(size = this.config.batchSize) {
        return this.queue.splice(0, size);
    }
    /** Get current queue size */
    get size() {
        return this.queue.length;
    }
    /** Check if queue is empty */
    get isEmpty() {
        return this.queue.length === 0;
    }
    /** Clear all items */
    clear() {
        this.queue = [];
        this.clearFlushTimer();
    }
    // ──────────────────────────────────────────────────────
    // FLUSH SCHEDULING
    // ──────────────────────────────────────────────────────
    scheduleFlush(delayMs) {
        if (this.flushTimer)
            return;
        this.flushTimer = setTimeout(() => {
            this.flushTimer = null;
            if (!this.isEmpty) {
                this.emit('flush-ready');
            }
        }, delayMs);
    }
    clearFlushTimer() {
        if (this.flushTimer) {
            clearTimeout(this.flushTimer);
            this.flushTimer = null;
        }
    }
    // ──────────────────────────────────────────────────────
    // CLEANUP
    // ──────────────────────────────────────────────────────
    destroy() {
        this.clearFlushTimer();
        this.removeAllListeners();
        this.queue = [];
    }
}
/**
 * Explicit batch processor - consumer pattern
 *
 * Usage:
 *   const buffer = new BatchBuffer(queue, processor);
 *   await buffer.start();
 *   buffer.enqueue(item);
 *   await buffer.stop();
 */
export class BatchBuffer {
    queue;
    processor;
    running = false;
    constructor(queue, processor) {
        this.queue = queue;
        this.processor = processor;
    }
    // ──────────────────────────────────────────────────────
    // LIFECYCLE
    // ──────────────────────────────────────────────────────
    /** Start processing queue */
    start() {
        if (this.running)
            return;
        this.running = true;
        // Listen for flush events
        this.queue.on('flush-ready', () => this.processBatch());
        this.queue.on('hardcap-reached', () => this.processBatch());
    }
    /** Stop processing (drains queue first) */
    async stop() {
        this.running = false;
        // Drain remaining items
        while (!this.queue.isEmpty) {
            await this.processBatch();
        }
        this.queue.removeAllListeners();
    }
    /** Force immediate flush */
    async flush() {
        while (!this.queue.isEmpty) {
            await this.processBatch();
        }
    }
    // ──────────────────────────────────────────────────────
    // QUEUE INTERFACE
    // ──────────────────────────────────────────────────────
    enqueue(item) {
        this.queue.enqueue(item);
    }
    enqueueBatch(items) {
        this.queue.enqueueBatch(items);
    }
    get size() {
        return this.queue.size;
    }
    // ──────────────────────────────────────────────────────
    // PROCESSING
    // ──────────────────────────────────────────────────────
    async processBatch() {
        if (this.queue.isEmpty)
            return;
        const batch = this.queue.take();
        if (batch.length === 0)
            return;
        try {
            await this.processor(batch);
        }
        catch (error) {
            // Emit error but don't throw - let consumer handle
            this.queue.emit('error', error, batch);
        }
    }
}
// ============================================================
// FACTORY (Explicit wiring)
// ============================================================
export function createBatchBuffer(processor, config) {
    const fullConfig = { ...DEFAULT_BATCH_CONFIG, ...config };
    const queue = new BatchQueue(fullConfig);
    return new BatchBuffer(queue, processor);
}
