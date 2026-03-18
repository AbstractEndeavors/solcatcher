import type { TransactionSignature } from "./../types.js";
/**
 * Check if value is a valid Solana transaction signature
 */
export declare function isSigkey(obj: unknown): obj is TransactionSignature;
/**
 * Normalize input to TransactionSignature
 */
export declare function getSigkey(obj: unknown): TransactionSignature;
