/**
 * BATCH BUFFER (Queue-based)
 * 
 * Principle: Queues over callbacks
 * 
 * Instead of callback-based flushing, uses an async queue pattern
 * that consumers can process explicitly.
 */

import { EventEmitter } from 'events';
import type {IntLike} from '@imports';
// ============================================================
// BATCH QUEUE (Queue-based pattern)
// ============================================================

export interface BatchBufferConfig {
  batchSize: IntLike;
  maxDelayMs: IntLike;
  hardCap: IntLike;
}

export const DEFAULT_BATCH_CONFIG: BatchBufferConfig = {
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
export class BatchQueue<T> extends EventEmitter {
  private queue: T[] = [];
  private processing = false;
  private flushTimer: NodeJS.Timeout | null = null;

  constructor(
    private readonly config: BatchBufferConfig = DEFAULT_BATCH_CONFIG
  ) {
    super();
  }

  // ──────────────────────────────────────────────────────
  // PUBLIC API
  // ──────────────────────────────────────────────────────

  /** Add item to queue */
  enqueue(item: T): void {
    this.queue.push(item);

    // Hard cap - flush immediately
    if (this.queue.length as number >= (this.config.hardCap as number)) {
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
  enqueueBatch(items: T[]): void {
    items.forEach(item => this.enqueue(item));
  }

  /** Get next batch without removing from queue */
  peek(size: IntLike = this.config.batchSize): T[] {
    return this.queue.slice(0, size as number);
  }

  /** Take next batch from queue (removes items) */
  take(size: IntLike = this.config.batchSize): T[] {
    return this.queue.splice(0, size as number);
  }

  /** Get current queue size */
  get size(): IntLike {
    return this.queue.length;
  }

  /** Check if queue is empty */
  get isEmpty(): boolean {
    return this.queue.length === 0;
  }

  /** Clear all items */
  clear(): void {
    this.queue = [];
    this.clearFlushTimer();
  }

  // ──────────────────────────────────────────────────────
  // FLUSH SCHEDULING
  // ──────────────────────────────────────────────────────

  private scheduleFlush(delayMs: IntLike): void {
    if (this.flushTimer) return;

    this.flushTimer = setTimeout(() => {
      this.flushTimer = null;
      if (!this.isEmpty) {
        this.emit('flush-ready');
      }
    }, delayMs as any);
  }

  private clearFlushTimer(): void {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
  }

  // ──────────────────────────────────────────────────────
  // CLEANUP
  // ──────────────────────────────────────────────────────

  destroy(): void {
    this.clearFlushTimer();
    this.removeAllListeners();
    this.queue = [];
  }
}

// ============================================================
// ASYNC BATCH PROCESSOR (Explicit queue consumer)
// ============================================================

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
export class BatchBuffer<T> {
  private running = false;

  constructor(
    private readonly queue: BatchQueue<T>,
    private readonly processor: BatchProcessor<T>
  ) {}

  // ──────────────────────────────────────────────────────
  // LIFECYCLE
  // ──────────────────────────────────────────────────────

  /** Start processing queue */
  start(): void {
    if (this.running) return;
    this.running = true;

    // Listen for flush events
    this.queue.on('flush-ready', () => this.processBatch());
    this.queue.on('hardcap-reached', () => this.processBatch());
  }

  /** Stop processing (drains queue first) */
  async stop(): Promise<void> {
    this.running = false;
    
    // Drain remaining items
    while (!this.queue.isEmpty) {
      await this.processBatch();
    }

    this.queue.removeAllListeners();
  }

  /** Force immediate flush */
  async flush(): Promise<void> {
    while (!this.queue.isEmpty) {
      await this.processBatch();
    }
  }

  // ──────────────────────────────────────────────────────
  // QUEUE INTERFACE
  // ──────────────────────────────────────────────────────

  enqueue(item: T): void {
    this.queue.enqueue(item);
  }

  enqueueBatch(items: T[]): void {
    this.queue.enqueueBatch(items);
  }

  get size(): IntLike {
    return this.queue.size;
  }

  // ──────────────────────────────────────────────────────
  // PROCESSING
  // ──────────────────────────────────────────────────────

  private async processBatch(): Promise<void> {
    if (this.queue.isEmpty) return;

    const batch = this.queue.take();
    if (batch.length === 0) return;

    try {
      await this.processor(batch);
    } catch (error) {
      // Emit error but don't throw - let consumer handle
      this.queue.emit('error', error, batch);
    }
  }
}

// ============================================================
// FACTORY (Explicit wiring)
// ============================================================

export function createBatchBuffer<T>(
  processor: BatchProcessor<T>,
  config?: Partial<BatchBufferConfig>
): BatchBuffer<T> {
  const fullConfig = { ...DEFAULT_BATCH_CONFIG, ...config };
  const queue = new BatchQueue<T>(fullConfig);
  return new BatchBuffer(queue, processor);
}
