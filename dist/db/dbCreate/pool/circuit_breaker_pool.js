export class CircuitBreakerPool {
    pool;
    state = 'CLOSED';
    failureCount = 0;
    successCount = 0;
    nextRetry = 0;
    config;
    recentFailures = []; // ✅ Store actual errors
    constructor(pool, config = {}) {
        this.pool = pool;
        this.config = {
            failureThreshold: config.failureThreshold ?? 5,
            successThreshold: config.successThreshold ?? 2,
            timeout: config.timeout ?? 30000,
            retryDelay: config.retryDelay ?? 5000,
        };
    }
    async query(sql, params) {
        if (this.state === 'OPEN') {
            if (Date.now() < this.nextRetry) {
                // ✅ LOG THE RECENT FAILURES WHEN CIRCUIT IS OPEN
                console.log({
                    logType: 'error',
                    message: 'Circuit breaker OPEN - showing recent failures',
                    state: this.state,
                    failureCount: this.failureCount,
                    nextRetryIn: Math.floor((this.nextRetry - Date.now()) / 1000) + 's',
                    recentFailures: this.recentFailures.slice(-5).map(f => ({
                        ago: Math.floor((Date.now() - f.timestamp) / 1000) + 's ago',
                        error: f.error,
                        code: f.errorCode,
                        stack: f.errorStack?.split('\n').slice(0, 3).join('\n') // First 3 lines
                    }))
                });
                throw new Error(`Circuit breaker OPEN: database pool unavailable (${this.failureCount} recent failures)`);
            }
            this.transitionTo('HALF_OPEN');
        }
        try {
            const result = await this.pool.query(sql, params);
            this.onSuccess();
            return result;
        }
        catch (error) {
            this.onFailure(error); // ✅ Pass the actual error
            throw error;
        }
    }
    onSuccess() {
        this.failureCount = 0;
        if (this.state === 'HALF_OPEN') {
            this.successCount++;
            if (this.successCount >= this.config.successThreshold) {
                this.transitionTo('CLOSED');
                this.successCount = 0;
                console.log({
                    logType: 'info',
                    message: 'Circuit breaker CLOSED',
                    details: 'Database pool healthy again'
                });
            }
        }
    }
    onFailure(error) {
        // ✅ CAPTURE THE ACTUAL ERROR DETAILS
        const failureRecord = {
            timestamp: Date.now(),
            error: error.message || String(error),
            errorCode: error.code,
            errorStack: error.stack
        };
        this.recentFailures.push(failureRecord);
        // Keep only last 10 failures
        if (this.recentFailures.length > 10) {
            this.recentFailures.shift();
        }
        // ✅ LOG EACH FAILURE AS IT HAPPENS
        console.log({
            logType: 'error',
            message: 'Database query failed - circuit breaker tracking',
            error: failureRecord.error,
            errorCode: failureRecord.errorCode,
            stack: failureRecord.errorStack,
            currentFailureCount: this.failureCount + 1,
            threshold: this.config.failureThreshold,
            state: this.state
        });
        this.successCount = 0;
        this.failureCount++;
        if (this.failureCount >= this.config.failureThreshold &&
            this.state !== 'OPEN') {
            this.transitionTo('OPEN');
            this.nextRetry = Date.now() + this.config.retryDelay;
            // ✅ LOG ALL RECENT FAILURES WHEN OPENING
            console.log({
                logType: 'error',
                message: 'Circuit breaker OPENING',
                failureCount: this.failureCount,
                allRecentFailures: this.recentFailures.map(f => ({
                    ago: Math.floor((Date.now() - f.timestamp) / 1000) + 's ago',
                    error: f.error,
                    code: f.errorCode
                })),
                nextRetryIn: this.config.retryDelay / 1000 + 's'
            });
        }
    }
    transitionTo(newState) {
        console.log({
            logType: 'info',
            message: 'Circuit breaker state transition',
            from: this.state,
            to: newState,
            failureCount: this.failureCount,
            successCount: this.successCount
        });
        this.state = newState;
    }
    async end() {
        return this.pool.end();
    }
    get currentState() {
        return this.state;
    }
}
