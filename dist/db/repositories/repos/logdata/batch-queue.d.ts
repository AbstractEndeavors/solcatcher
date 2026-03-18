/**
 * BATCH BUFFER (Queue-based)
 *
 * Principle: Queues over callbacks
 *
 * Instead of callback-based flushing, uses an async queue pattern
 * that consumers can process explicitly.
 */
import { EventEmitter } from 'events';
import type { IntLike } from '@imports';
export interface BatchBufferConfig {
    batchSize: IntLike;
    maxDelayMs: IntLike;
    hardCap: IntLike;
}
export declare const DEFAULT_BATCH_CONFIG: BatchBufferConfig;
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
export declare class BatchQueue<T> extends EventEmitter {
    private readonly config;
    private queue;
    private processing;
    private flushTimer;
    constructor(config?: BatchBufferConfig);
    /** Add item to queue */
    enqueue(item: T): void;
    /** Add multiple items */
    enqueueBatch(items: T[]): void;
    /** Get next batch without removing from queue */
    peek(size?: IntLike): T[];
    /** Take next batch from queue (removes items) */
    take(size?: IntLike): T[];
    /** Get current queue size */
    get size(): IntLike;
    /** Check if queue is empty */
    get isEmpty(): boolean;
    /** Clear all items */
    clear(): void;
    private scheduleFlush;
    private clearFlushTimer;
    destroy(): void;
}
export interface BatchProcessor<T> {
    (batch: T[]): Promise<void>;
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
export declare class BatchBuffer<T> {
    private readonly queue;
    private readonly processor;
    private running;
    constructor(queue: BatchQueue<T>, processor: BatchProcessor<T>);
    /** Start processing queue */
    start(): void;
    /** Stop processing (drains queue first) */
    stop(): Promise<void>;
    /** Force immediate flush */
    flush(): Promise<void>;
    enqueue(item: T): void;
    enqueueBatch(items: T[]): void;
    get size(): IntLike;
    private processBatch;
}
export declare function createBatchBuffer<T>(processor: BatchProcessor<T>, config?: Partial<BatchBufferConfig>): BatchBuffer<T>;
