import { type IdLike } from './imports.js';
/**
 * Extract all rows from query result
 */
export declare function extractRows<T = any>(result: any): T[];
export declare function expectSingleRow<T>(value: T | T[] | null): T;
export declare function extractSingle<T>(value: T | T[]): T;
export declare function firstRowOrNull<T>(value: T | T[] | null): T | null;
export declare function extractRow<T = any>(result: any): T | null;
export declare function firstRowIdOrNull(result: {
    rows?: {
        id?: unknown;
    }[];
} | null | undefined): IdLike | null;
