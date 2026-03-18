export class CircuitBreakerPool {
    pool;
    state = 'CLOSED';
    failureCount = 0;
    successCount = 0;
    nextRetry = 0;
    config;
    recentFailures = [];
    constructor(pool, config = {}) {
        this.pool = pool;
        this.config = {
            failureThreshold: config.failureThreshold ?? 5,
            successThreshold: config.successThreshold ?? 2,
            timeout: config.timeout ?? 30_000,
            retryDelay: config.retryDelay ?? 5_000,
        };
    }
    async query(sql, params = []) {
        if (this.state === 'OPEN') {
            if (Date.now() < this.nextRetry) {
                throw new Error(`Circuit breaker OPEN: database unavailable (${this.failureCount} failures)`);
            }
            this.transitionTo('HALF_OPEN');
        }
        try {
            const result = await this.pool.query(sql, params);
            this.onSuccess();
            return result;
        }
        catch (err) {
            this.onFailure(err);
            throw err;
        }
    }
    async connect() {
        return this.pool.connect();
    }
    async end() {
        return this.pool.end();
    }
    getState() {
        return this.state;
    }
    /* ───────────── internals ───────────── */
    onSuccess() {
        this.failureCount = 0;
        if (this.state === 'HALF_OPEN') {
            this.successCount++;
            if (this.successCount >= this.config.successThreshold) {
                this.successCount = 0;
                this.transitionTo('CLOSED');
            }
        }
    }
    onFailure(error) {
        const record = {
            timestamp: Date.now(),
            error: error?.message ?? String(error),
            errorCode: error?.code,
            errorStack: error?.stack,
        };
        this.recentFailures.push(record);
        if (this.recentFailures.length > 10) {
            this.recentFailures.shift();
        }
        this.successCount = 0;
        this.failureCount++;
        if (this.failureCount >= this.config.failureThreshold &&
            this.state !== 'OPEN') {
            this.transitionTo('OPEN');
            this.nextRetry = Date.now() + this.config.retryDelay;
        }
    }
    transitionTo(next) {
        this.state = next;
    }
}
