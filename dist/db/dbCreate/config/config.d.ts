import type { RetryConfig, ConnectionLimits, DatabaseEnv, DatabaseConfig, TableRegistry, TableSchema } from "@imports";
export declare function createDatabaseConfig(env: DatabaseEnv, overrides?: {
    retryConfig?: Partial<RetryConfig>;
    connectionLimits?: Partial<ConnectionLimits>;
}): DatabaseConfig;
export declare function sortTables(registry: TableRegistry): TableSchema[];
export declare function createTableRegistry(): Promise<TableRegistry>;
