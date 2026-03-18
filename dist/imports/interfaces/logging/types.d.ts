export type LogContext = {
    op: string;
    signature?: string;
    queryKey?: string;
    rows?: number;
    ms?: number;
    attempt?: number;
    note?: string;
    [k: string]: unknown;
};
export declare function withCtx(base: LogContext, extra?: Partial<LogContext>): LogContext;
export declare function redacted<T extends object>(o: T, fields?: string[]): T;
export interface Queryable {
    query<T = any>(text: string, params?: any[]): Promise<{
        rows: T[];
        rowCount?: number;
    }>;
}
export declare class InstrumentedClient implements Queryable {
    private readonly inner;
    constructor(inner: Queryable);
    query<T = any>(text: string, params?: any[], meta?: {
        op?: string;
        queryKey?: string;
        signature?: string;
    }): Promise<{
        rows: T[];
        rowCount?: number;
    }>;
}
