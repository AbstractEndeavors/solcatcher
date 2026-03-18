// ============================================================
// TIME RANGE (Query parameters)
// ============================================================
export class TimeRange {
    start;
    end;
    constructor(start, end) {
        this.start = start;
        this.end = end;
        // Validate range
        const startMs = this.startTimestamp;
        const endMs = this.endTimestamp;
        if (startMs > endMs) {
            throw new Error('TimeRange: start must be before end');
        }
    }
    get startTimestamp() {
        return typeof this.start === 'bigint' ? this.start : BigInt(this.start.getTime());
    }
    get endTimestamp() {
        return typeof this.end === 'bigint' ? this.end : BigInt(this.end.getTime());
    }
    get durationMs() {
        return this.endTimestamp - this.startTimestamp;
    }
    get durationSeconds() {
        return Number(this.durationMs) / 1000;
    }
    get durationMinutes() {
        return this.durationSeconds / 60;
    }
    get durationHours() {
        return this.durationMinutes / 60;
    }
    get durationDays() {
        return this.durationHours / 24;
    }
    contains(timestamp) {
        const ts = typeof timestamp === 'bigint' ? timestamp : BigInt(timestamp.getTime());
        return ts >= this.startTimestamp && ts <= this.endTimestamp;
    }
    static last24Hours() {
        const end = new Date();
        const start = new Date(end.getTime() - 24 * 60 * 60 * 1000);
        return new TimeRange(start, end);
    }
    static last7Days() {
        const end = new Date();
        const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
        return new TimeRange(start, end);
    }
    static last30Days() {
        const end = new Date();
        const start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
        return new TimeRange(start, end);
    }
    static today() {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const end = new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1);
        return new TimeRange(start, end);
    }
    static thisWeek() {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const start = new Date(now.getTime() - dayOfWeek * 24 * 60 * 60 * 1000);
        start.setHours(0, 0, 0, 0);
        const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000 - 1);
        return new TimeRange(start, end);
    }
    static thisMonth() {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        return new TimeRange(start, end);
    }
}
