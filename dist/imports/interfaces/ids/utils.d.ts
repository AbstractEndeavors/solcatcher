import type { IdLike } from './imports.js';
import { isPositive } from './imports.js';
export declare function isIdArray(value: unknown): value is IdLike[];
export declare const isId: typeof isPositive;
export declare const isIds: typeof isIdArray;
export declare function normalizeId(value: unknown): number | null;
export declare function firstNormalizedId(...values: unknown[]): number | null;
export declare function extractId(value: {
    id?: unknown;
} | null | undefined): number | null;
export declare function getNonEmptyNormalizedId(obj: unknown): IdLike | null;
export declare function getIdOrNull(value: {
    id?: unknown;
} | null | undefined): number | null;
export declare function normalizeIdFields(input: unknown, fields?: string[] | string): number | null;
