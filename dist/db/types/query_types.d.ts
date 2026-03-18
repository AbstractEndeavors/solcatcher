export interface QueryCategory {
    name: string;
    description: string;
    queries: Record<string, string>;
}
export interface QueryOptions {
    retries?: number;
    throwOnEmpty?: boolean;
}
