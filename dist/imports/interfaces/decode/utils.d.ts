import type { DecodedProgramData } from './types.js';
export declare function normalizeDecodedData<T extends Record<string, any>>(data: T): T;
/**
 * Generic heuristic decoder
 */
export declare function heuristicDecodeProgramData(base64: string): DecodedProgramData;
export declare class Cursor {
    readonly b: Buffer;
    o: number;
    constructor(b: Buffer, o?: number);
    u64(): bigint;
    pubkey(): string;
}
export declare const u8: (b: Buffer, o: number) => number;
export declare const u64: (b: Buffer, o: number) => bigint;
export declare const i64: (b: Buffer, o: number) => bigint;
export declare const pubkey: (b: Buffer, o: number) => string;
export declare const str: (b: Buffer, o: number) => {
    value: string;
    next: number;
};
/**
 * Type guard for decoded registry output.
 * Use this BEFORE destructuring decode() results.
 */
export declare function isDecodedResult(x: unknown): x is {
    name: string;
    category: string;
    data: Record<string, unknown>;
};
