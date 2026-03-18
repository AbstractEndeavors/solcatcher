export declare class TimeRange {
    readonly start: bigint | Date;
    readonly end: bigint | Date;
    constructor(start: bigint | Date, end: bigint | Date);
    get startTimestamp(): bigint;
    get endTimestamp(): bigint;
    get durationMs(): bigint;
    get durationSeconds(): number;
    get durationMinutes(): number;
    get durationHours(): number;
    get durationDays(): number;
    contains(timestamp: bigint | Date): boolean;
    static last24Hours(): TimeRange;
    static last7Days(): TimeRange;
    static last30Days(): TimeRange;
    static today(): TimeRange;
    static thisWeek(): TimeRange;
    static thisMonth(): TimeRange;
}
