/**
 * SOLANA VERIFICATION
 *
 * Domain-specific validators for Solana primitives.
 * All build on the base verify module.
 */
import { requireField, verifyBase58WithLength, verifyPositiveInt, } from './verify.js';
// ============================================================
// SOLANA ADDRESS (32-44 chars, base58)
// ============================================================
export function verifySolanaAddress(value, name, ctx) {
    verifyBase58WithLength(value, name, 32, 44, ctx);
}
// ============================================================
// DOMAIN ALIASES (explicit, not magic)
// ============================================================
export function verifyMint(value, ctx) {
    verifySolanaAddress(value, 'mint', ctx);
}
export function verifyProgramId(value, ctx) {
    verifySolanaAddress(value, 'program_id', ctx);
}
export function verifyAccount(value, ctx) {
    verifySolanaAddress(value, 'account', ctx);
}
export function verifyUserAddress(value, ctx) {
    verifySolanaAddress(value, 'user_address', ctx);
}
export function verifyBondingCurve(value, ctx) {
    verifySolanaAddress(value, 'bonding_curve', ctx);
}
export function verifyAssociatedBondingCurve(value, ctx) {
    verifySolanaAddress(value, 'associated_bonding_curve', ctx);
}
export function verifyPriceToken(value, ctx) {
    verifySolanaAddress(value, 'price_token', ctx);
}
export function verifyMintAuthority(value, ctx) {
    verifySolanaAddress(value, 'mint_authority', ctx);
}
export function verifyFreezeAuthority(value, ctx) {
    verifySolanaAddress(value, 'freeze_authority', ctx);
}
// ============================================================
// SOLANA SIGNATURE (80-90 chars, base58)
// ============================================================
export function verifySignature(value, ctx) {
    verifyBase58WithLength(value, 'signature', 80, 90, ctx);
}
export function verifyProcessedUntil(value, ctx) {
    verifyBase58WithLength(value, 'processed_until', 80, 90, ctx);
}
// ============================================================
// IDS (positive integers)
// ============================================================
export function verifyId(value, ctx) {
    verifyPositiveInt(value, 'id', ctx);
}
export function verifyLogId(value, ctx) {
    verifyPositiveInt(value, 'log_id', ctx);
}
export function verifyMetaId(value, ctx) {
    verifyPositiveInt(value, 'meta_id', ctx);
}
export function verifyPairId(value, ctx) {
    verifyPositiveInt(value, 'pair_id', ctx);
}
export function verifyTxnId(value, ctx) {
    verifyPositiveInt(value, 'txn_id', ctx);
}
export function verifySlot(value, ctx) {
    verifyPositiveInt(value, 'slot', ctx);
}
/**
 * Verify pairs input - handles string (mint) or object
 */
export function verifyPairsInput(input, ctx) {
    const context = ctx ?? 'verifyPairsInput';
    // String → treat as mint
    if (typeof input === 'string') {
        verifyMint(input, context);
        return;
    }
    if (typeof input !== 'object' || input === null) {
        throw new Error(`${context}: input must be string or object`);
    }
    const o = input;
    // Required fields
    verifyMint(o.mint ?? o.token ?? o.token_mint, context);
    verifyProgramId(o.program_id, context);
    verifyBondingCurve(o.bonding_curve, context);
    verifyAssociatedBondingCurve(o.associated_bonding_curve, context);
    // Optional but validated if present
    if ('log_id' in o && o.log_id != null) {
        verifyLogId(o.log_id, context);
    }
    if ('meta_id' in o && o.meta_id != null) {
        verifyMetaId(o.meta_id, context);
    }
}
/**
 * Verify metadata input - handles string (mint) or object
 */
export function verifyMetadataInput(input, ctx) {
    const context = ctx ?? 'verifyMetadataInput';
    // String → treat as mint
    if (typeof input === 'string') {
        verifyMint(input, context);
        return;
    }
    if (typeof input !== 'object' || input === null) {
        throw new Error(`${context}: input must be string or object`);
    }
    const o = input;
    verifyMint(o.mint, context);
}
/**
 * Verify transaction input - handles string (signature) or object
 */
export function verifyTransactionInput(input, ctx) {
    const context = ctx ?? 'verifyTransactionInput';
    // String → treat as signature
    if (typeof input === 'string') {
        verifySignature(input, context);
        return;
    }
    if (typeof input !== 'object' || input === null) {
        throw new Error(`${context}: input must be string or object`);
    }
    const o = input;
    verifySignature(o.signature, context);
}
