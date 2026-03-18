// src/pipeline/workers/base.ts
// ═══════════════════════════════════════════════════════════════════
// ABSTRACT BATCH WORKER - SHARED LOGIC
// ═══════════════════════════════════════════════════════════════════
export class BatchWorker {
    config;
    timer = null;
    running = false;
    paused = false;
    metrics = {
        ticks: 0,
        published: 0,
        errors: 0,
    };
    constructor(config) {
        this.config = config;
    }
    // ─────────────────────────────────────────────
    // LIFECYCLE
    // ─────────────────────────────────────────────
    async start() {
        if (this.timer)
            return;
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
    async stop() {
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
    async pause() {
        this.paused = true;
        console.log({
            logType: 'info',
            message: `${this.config.name} worker paused`,
            queue: this.config.queue,
        });
    }
    async resume() {
        this.paused = false;
        console.log({
            logType: 'info',
            message: `${this.config.name} worker resumed`,
            queue: this.config.queue,
        });
    }
    async tickNow() {
        await this.tick();
    }
    isPaused() {
        return this.paused;
    }
    // ─────────────────────────────────────────────
    // TICK
    // ─────────────────────────────────────────────
    async tick() {
        if (this.running || this.paused)
            return;
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
        }
        catch (err) {
            this.metrics.errors++;
            console.error({
                logType: 'error',
                message: `${this.config.name} tick failed`,
                details: { error: err instanceof Error ? err.message : String(err) }
            });
        }
        finally {
            this.running = false;
        }
    }
    // ─────────────────────────────────────────────
    // METRICS
    // ─────────────────────────────────────────────
    getMetrics() {
        return { ...this.metrics };
    }
}
