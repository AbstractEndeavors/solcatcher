export declare function normalizeString(input: unknown, field: string): string;
export declare function isString(value: unknown, field: string): value is String;
/**
 * Ensure a value can be safely treated as a string.
 * - bigint → string
 * - number / boolean → String()
 * - string → passthrough
 * - null / undefined → null (or throw, configurable)
 * - object → JSON string (bigint-safe)
 */
export declare function ensureString(value: unknown, opts?: {
    allowNull?: boolean;
    label?: string;
}): string | null;
export declare function ensureStringOptional(value: unknown): string | null;
