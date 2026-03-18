/**
 * VERIFICATION MODULE
 *
 * Single import point for all validators.
 * Registry-based, explicit, no magic.
 */
export * from './verify.js';
export * from './solana.js';
import * as verify from './verify.js';
import * as solana from './solana.js';
export declare const Validators: {
    readonly requireField: typeof verify.requireField;
    readonly requireOneOf: typeof verify.requireOneOf;
    readonly string: typeof verify.verifyString;
    readonly number: typeof verify.verifyNumber;
    readonly array: typeof verify.verifyArray;
    readonly nonEmptyArray: typeof verify.verifyNonEmptyArray;
    readonly positiveInt: typeof verify.verifyPositiveInt;
    readonly nonNegativeInt: typeof verify.verifyNonNegativeInt;
    readonly inRange: typeof verify.verifyInRange;
    readonly length: typeof verify.verifyLength;
    readonly minLength: typeof verify.verifyMinLength;
    readonly pattern: typeof verify.verifyPattern;
    readonly base58: typeof verify.verifyBase58;
    readonly base58WithLength: typeof verify.verifyBase58WithLength;
    readonly solanaAddress: typeof solana.verifySolanaAddress;
    readonly mint: typeof solana.verifyMint;
    readonly programId: typeof solana.verifyProgramId;
    readonly account: typeof solana.verifyAccount;
    readonly userAddress: typeof solana.verifyUserAddress;
    readonly bondingCurve: typeof solana.verifyBondingCurve;
    readonly associatedBondingCurve: typeof solana.verifyAssociatedBondingCurve;
    readonly priceToken: typeof solana.verifyPriceToken;
    readonly mintAuthority: typeof solana.verifyMintAuthority;
    readonly freezeAuthority: typeof solana.verifyFreezeAuthority;
    readonly signature: typeof solana.verifySignature;
    readonly processedUntil: typeof solana.verifyProcessedUntil;
    readonly id: typeof solana.verifyId;
    readonly logId: typeof solana.verifyLogId;
    readonly metaId: typeof solana.verifyMetaId;
    readonly pairId: typeof solana.verifyPairId;
    readonly txnId: typeof solana.verifyTxnId;
    readonly slot: typeof solana.verifySlot;
    readonly pairsInput: typeof solana.verifyPairsInput;
    readonly metadataInput: typeof solana.verifyMetadataInput;
    readonly transactionInput: typeof solana.verifyTransactionInput;
};
export type ValidatorRegistry = typeof Validators;
export type ValidatorKey = keyof ValidatorRegistry;
