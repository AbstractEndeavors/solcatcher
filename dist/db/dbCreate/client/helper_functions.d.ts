import type { QueryResult, QueryResultRow } from 'pg';
import type { DatabaseConfig, DatabaseClient } from '@imports';
export declare function createDatabaseClient(config: DatabaseConfig): DatabaseClient;
/**
 * Extract first row from query result
 */
export declare function extractRow<T extends QueryResultRow = any>(result: QueryResult<T> | null): T | null;
export declare function extractId(result: QueryResult<any> | null): number | null;
/**
 * Extract all rows from query result
 */
export declare function extractRows<T extends QueryResultRow = any>(result: QueryResult<T> | null): T[];
