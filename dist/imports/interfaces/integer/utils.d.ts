import type { IntLike } from './imports.js';
import type { PositiveInt } from './types.js';
export declare function normalizePositiveInt(value: unknown): IntLike;
export declare function toPositiveInt(value: unknown): PositiveInt | null;
export declare function isPositive(value: unknown): value is PositiveInt;
export declare function normalizeNumber(input: unknown, fields: string | string[], opts?: {
    min?: number;
    max?: number;
}): number;
