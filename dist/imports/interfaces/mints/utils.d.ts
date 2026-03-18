import type { MintLike } from './imports.js';
export declare function isValidMint(value: string): boolean;
export declare function normalizeMintFields(input: unknown, fields?: string | string[]): string | null;
export declare function normalizeMint(value: unknown): string | null;
export declare function isMint(value: unknown): value is MintLike;
export declare function isMintArray(value: unknown): value is MintLike[];
export declare const isMints: typeof isMintArray;
export declare function firstNormalizedMint(...values: unknown[]): string | null;
export declare function extractMint(value: {
    mint?: unknown;
} | null | undefined): string | null;
export declare const getMintOrNull: typeof extractMint;
