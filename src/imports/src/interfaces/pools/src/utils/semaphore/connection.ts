import type {
  SemaphoreConfig,
  SemaphoreMetrics,
  WaitingRequest
} from '../../types.js';

export class ConnectionSemaphore {
  private available: number;
  private queue: WaitingRequest[] = [];
  private metrics: SemaphoreMetrics = {
    acquired: 0,
    waiting: 0,
    totalAcquired: 0,
    totalReleased: 0,
    totalTimeout: 0,
    currentConcurrency: 0,
  };

  constructor(private readonly config: SemaphoreConfig) {
    this.available = config.maxConcurrent;
  }

  async acquire(): Promise<() => void> {
    if (this.available > 0) {
      this.available--;
      this.recordAcquisition();
      return this.createReleaser();
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.removeFromQueue(req);
        this.metrics.totalTimeout++;
        reject(new Error(`Semaphore timeout after ${this.config.queueTimeout}ms`));
      }, this.config.queueTimeout);

      const req: WaitingRequest = {
        resolve: () => {
          clearTimeout(timeout);
          this.recordAcquisition();
          resolve(this.createReleaser());
        },
        reject,
        enqueuedAt: Date.now(),
        timeoutHandle: timeout,
      };

      this.queue.push(req);
      this.metrics.waiting = this.queue.length;
    });
  }

  getMetrics(): SemaphoreMetrics {
    return { ...this.metrics };
  }

  /* ───────── internals ───────── */

  private createReleaser(): () => void {
    let released = false;
    return () => {
      if (released) return;
      released = true;
      this.release();
    };
  }

  private release() {
    this.metrics.totalReleased++;
    this.metrics.currentConcurrency--;

    if (this.queue.length > 0) {
      const next = this.queue.shift()!;
      this.metrics.waiting = this.queue.length;
      next.resolve();
    } else {
      this.available++;
    }
  }

  private removeFromQueue(req: WaitingRequest) {
    const idx = this.queue.indexOf(req);
    if (idx !== -1) {
      this.queue.splice(idx, 1);
      this.metrics.waiting = this.queue.length;
    }
  }

  private recordAcquisition() {
    this.metrics.totalAcquired++;
    this.metrics.currentConcurrency++;
    this.metrics.acquired = this.metrics.currentConcurrency;
  }
}