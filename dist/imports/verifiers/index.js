/**
 * VERIFICATION MODULE
 *
 * Single import point for all validators.
 * Registry-based, explicit, no magic.
 */
// Export all primitives
export * from './verify.js';
// Export all Solana-specific validators
export * from './solana.js';
// Re-export commonly used validators as a registry object
// (for when you want to pass validators around as data)
import * as verify from './verify.js';
import * as solana from './solana.js';
export const Validators = {
    // Primitives
    requireField: verify.requireField,
    requireOneOf: verify.requireOneOf,
    string: verify.verifyString,
    number: verify.verifyNumber,
    array: verify.verifyArray,
    nonEmptyArray: verify.verifyNonEmptyArray,
    positiveInt: verify.verifyPositiveInt,
    nonNegativeInt: verify.verifyNonNegativeInt,
    inRange: verify.verifyInRange,
    length: verify.verifyLength,
    minLength: verify.verifyMinLength,
    pattern: verify.verifyPattern,
    base58: verify.verifyBase58,
    base58WithLength: verify.verifyBase58WithLength,
    // Solana domain
    solanaAddress: solana.verifySolanaAddress,
    mint: solana.verifyMint,
    programId: solana.verifyProgramId,
    account: solana.verifyAccount,
    userAddress: solana.verifyUserAddress,
    bondingCurve: solana.verifyBondingCurve,
    associatedBondingCurve: solana.verifyAssociatedBondingCurve,
    priceToken: solana.verifyPriceToken,
    mintAuthority: solana.verifyMintAuthority,
    freezeAuthority: solana.verifyFreezeAuthority,
    signature: solana.verifySignature,
    processedUntil: solana.verifyProcessedUntil,
    id: solana.verifyId,
    logId: solana.verifyLogId,
    metaId: solana.verifyMetaId,
    pairId: solana.verifyPairId,
    txnId: solana.verifyTxnId,
    slot: solana.verifySlot,
    // Composite
    pairsInput: solana.verifyPairsInput,
    metadataInput: solana.verifyMetadataInput,
    transactionInput: solana.verifyTransactionInput,
};
