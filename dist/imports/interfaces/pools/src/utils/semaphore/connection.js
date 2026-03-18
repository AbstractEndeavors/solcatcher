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
    async acquire() {
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
            const req = {
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
    getMetrics() {
        return { ...this.metrics };
    }
    /* ───────── internals ───────── */
    createReleaser() {
        let released = false;
        return () => {
            if (released)
                return;
            released = true;
            this.release();
        };
    }
    release() {
        this.metrics.totalReleased++;
        this.metrics.currentConcurrency--;
        if (this.queue.length > 0) {
            const next = this.queue.shift();
            this.metrics.waiting = this.queue.length;
            next.resolve();
        }
        else {
            this.available++;
        }
    }
    removeFromQueue(req) {
        const idx = this.queue.indexOf(req);
        if (idx !== -1) {
            this.queue.splice(idx, 1);
            this.metrics.waiting = this.queue.length;
        }
    }
    recordAcquisition() {
        this.metrics.totalAcquired++;
        this.metrics.currentConcurrency++;
        this.metrics.acquired = this.metrics.currentConcurrency;
    }
}
