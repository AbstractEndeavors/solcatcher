/**
 * VERIFICATION PRIMITIVES
 *
 * Explicit validators with context propagation.
 * No magic, no defaults - every error tells you exactly what failed and where.
 */
export declare function requireField(value: any, name: string, ctx?: string): void;
export declare function requireOneOf(values: any, fields: string[], ctx?: string): void;
export declare function verifyString(value: any, name: string, ctx?: string): asserts value is string;
export declare function verifyNumber(value: unknown, name: string, ctx?: string): asserts value is number;
export declare function verifyArray(value: unknown, name: string, ctx?: string): asserts value is unknown[];
export declare function verifyNonEmptyArray(value: unknown, name: string, ctx?: string): asserts value is unknown[];
export declare function verifyPositiveInt(value: unknown, name: string, ctx?: string): asserts value is number;
export declare function verifyNonNegativeInt(value: unknown, name: string, ctx?: string): asserts value is number;
export declare function verifyInRange(value: unknown, name: string, min: number, max: number, ctx?: string): asserts value is number;
export declare function verifyLength(value: unknown, name: string, min: number, max: number, ctx?: string): asserts value is string;
export declare function verifyMinLength(value: unknown, name: string, min: number, ctx?: string): asserts value is string;
export declare function verifyPattern(value: unknown, name: string, pattern: RegExp, patternDesc: string, ctx?: string): asserts value is string;
export declare function verifyBase58(value: unknown, name: string, ctx?: string): asserts value is string;
export declare function verifyBase58WithLength(value: unknown, name: string, min: number, max: number, ctx?: string): asserts value is string;
