import type { BoolValue } from './imports.js';
export declare function normalizeBool(v: unknown): boolean | null;
export declare function toBool(value: unknown, defaultValue?: boolean): boolean;
export declare function isBool(value: unknown): value is BoolValue;
export declare function isBoolFalse(value: unknown): boolean;
export declare function isTruthyBool(value: unknown): boolean;
export declare function isFalsyBool(value: unknown): boolean;
