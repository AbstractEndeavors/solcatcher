/**
 * SOLANA VERIFICATION
 *
 * Domain-specific validators for Solana primitives.
 * All build on the base verify module.
 */
export declare function verifySolanaAddress(value: unknown, name: string, ctx?: string): asserts value is string;
export declare function verifyMint(value: unknown, ctx?: string): asserts value is string;
export declare function verifyProgramId(value: unknown, ctx?: string): asserts value is string;
export declare function verifyAccount(value: unknown, ctx?: string): asserts value is string;
export declare function verifyUserAddress(value: unknown, ctx?: string): asserts value is string;
export declare function verifyBondingCurve(value: unknown, ctx?: string): asserts value is string;
export declare function verifyAssociatedBondingCurve(value: unknown, ctx?: string): asserts value is string;
export declare function verifyPriceToken(value: unknown, ctx?: string): asserts value is string;
export declare function verifyMintAuthority(value: unknown, ctx?: string): asserts value is string;
export declare function verifyFreezeAuthority(value: unknown, ctx?: string): asserts value is string;
export declare function verifySignature(value: unknown, ctx?: string): asserts value is string;
export declare function verifyProcessedUntil(value: unknown, ctx?: string): asserts value is string;
export declare function verifyId(value: unknown, ctx?: string): asserts value is number;
export declare function verifyLogId(value: unknown, ctx?: string): asserts value is number;
export declare function verifyMetaId(value: unknown, ctx?: string): asserts value is number;
export declare function verifyPairId(value: unknown, ctx?: string): asserts value is number;
export declare function verifyTxnId(value: unknown, ctx?: string): asserts value is number;
export declare function verifySlot(value: unknown, ctx?: string): asserts value is number;
/**
 * Verify pairs input - handles string (mint) or object
 */
export declare function verifyPairsInput(input: unknown, ctx?: string): void;
/**
 * Verify metadata input - handles string (mint) or object
 */
export declare function verifyMetadataInput(input: unknown, ctx?: string): void;
/**
 * Verify transaction input - handles string (signature) or object
 */
export declare function verifyTransactionInput(input: unknown, ctx?: string): void;
