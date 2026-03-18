import type { DatabaseApp, DatabaseClient } from '@imports';
export declare class ApplicationContainer implements DatabaseApp {
    readonly db: DatabaseClient;
    readonly repos: any;
    private initialized;
    private readonly startedAt;
    constructor(db: DatabaseClient, repos: any);
    initialize(): Promise<void>;
    shutdown(): Promise<void>;
    healthCheck(): Promise<{
        healthy: boolean;
        uptime: number;
    }>;
}
