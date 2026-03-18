// src/pipeline/workers/base.ts
// ═══════════════════════════════════════════════════════════════════
// ABSTRACT BATCH WORKER - SHARED LOGIC
// ═══════════════════════════════════════════════════════════════════

import type { QueueName, QueuePayloadMap} from './../imports/index.js';
import {QueuePublisher} from './../transport/index.js'; 
export interface BatchWorkerConfig<T extends QueueName> {
  name: string;
  queue: T;
  batchSize: number;
  intervalMs: number;
  publisher: QueuePublisher;
}

export abstract class BatchWorker<T extends QueueName> {
  protected timer: NodeJS.Timeout | null = null;
  protected running = false;
  protected paused = false;
  protected metrics = {
    ticks: 0,
    published: 0,
    errors: 0,
  };

  constructor(protected readonly config: BatchWorkerConfig<T>) {}

  // ─────────────────────────────────────────────
  // ABSTRACT - Implement in subclass
  // ─────────────────────────────────────────────

  protected abstract fetchBatch(): Promise<QueuePayloadMap[T][]>;

  // ─────────────────────────────────────────────
  // LIFECYCLE
  // ─────────────────────────────────────────────

  async start(): Promise<void> {
    if (this.timer) return;

    this.timer = setInterval(() => this.tick(), this.config.intervalMs);

    console.log({
      logType: 'info',
      message: `${this.config.name} started`,
      details: {
        queue: this.config.queue,
        intervalMs: this.config.intervalMs,
        batchSize: this.config.batchSize,
      }
    });
  }

  async stop(): Promise<void> {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    console.log({
      logType: 'info',
      message: `${this.config.name} stopped`,
      details: this.metrics,
    });
  }

  async pause(): Promise<void> {
    this.paused = true;
    console.log({
      logType: 'info',
      message: `${this.config.name} worker paused`,
      queue: this.config.queue,
    });
  }

  async resume(): Promise<void> {
    this.paused = false;
    console.log({
      logType: 'info',
      message: `${this.config.name} worker resumed`,
      queue: this.config.queue,
    });
  }

  async tickNow(): Promise<void> {
    await this.tick();
  }

  isPaused(): boolean {
    return this.paused;
  }

  // ─────────────────────────────────────────────
  // TICK
  // ─────────────────────────────────────────────

  private async tick(): Promise<void> {
    if (this.running || this.paused) return;
    this.running = true;
    this.metrics.ticks++;

    try {
      const batch = await this.fetchBatch();

      if (batch.length === 0) {
        return;
      }

      console.log({
        logType: 'debug',
        message: `${this.config.name}: publishing ${batch.length} tasks`,
      });

      await this.config.publisher.publishBatch(this.config.queue, batch);
      this.metrics.published += batch.length;

    } catch (err) {
      this.metrics.errors++;
      console.error({
        logType: 'error',
        message: `${this.config.name} tick failed`,
        details: { error: err instanceof Error ? err.message : String(err) }
      });
    } finally {
      this.running = false;
    }
  }

  // ─────────────────────────────────────────────
  // METRICS
  // ─────────────────────────────────────────────

  getMetrics(): typeof this.metrics {
    return { ...this.metrics };
  }
}
