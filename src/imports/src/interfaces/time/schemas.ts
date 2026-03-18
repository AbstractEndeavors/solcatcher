// ============================================================
// TIME RANGE (Query parameters)
// ============================================================

export class TimeRange {
  constructor(
    public readonly start: bigint | Date,
    public readonly end: bigint | Date
  ) {
    // Validate range
    const startMs = this.startTimestamp;
    const endMs = this.endTimestamp;
    if (startMs > endMs) {
      throw new Error('TimeRange: start must be before end');
    }
  }

  get startTimestamp(): bigint {
    return typeof this.start === 'bigint' ? this.start : BigInt(this.start.getTime());
  }

  get endTimestamp(): bigint {
    return typeof this.end === 'bigint' ? this.end : BigInt(this.end.getTime());
  }

  get durationMs(): bigint {
    return this.endTimestamp - this.startTimestamp;
  }

  get durationSeconds(): number {
    return Number(this.durationMs) / 1000;
  }

  get durationMinutes(): number {
    return this.durationSeconds / 60;
  }

  get durationHours(): number {
    return this.durationMinutes / 60;
  }

  get durationDays(): number {
    return this.durationHours / 24;
  }

  contains(timestamp: bigint | Date): boolean {
    const ts = typeof timestamp === 'bigint' ? timestamp : BigInt(timestamp.getTime());
    return ts >= this.startTimestamp && ts <= this.endTimestamp;
  }

  static last24Hours(): TimeRange {
    const end = new Date();
    const start = new Date(end.getTime() - 24 * 60 * 60 * 1000);
    return new TimeRange(start, end);
  }

  static last7Days(): TimeRange {
    const end = new Date();
    const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
    return new TimeRange(start, end);
  }

  static last30Days(): TimeRange {
    const end = new Date();
    const start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
    return new TimeRange(start, end);
  }

  static today(): TimeRange {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1);
    return new TimeRange(start, end);
  }

  static thisWeek(): TimeRange {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const start = new Date(now.getTime() - dayOfWeek * 24 * 60 * 60 * 1000);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000 - 1);
    return new TimeRange(start, end);
  }

  static thisMonth(): TimeRange {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    return new TimeRange(start, end);
  }
}
