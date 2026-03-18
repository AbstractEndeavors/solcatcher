import { BondingCurveDataResult } from './schemas.js';
import { type AddressLike } from '@imports';
export interface SignatureResult {
    signature: string;
    blockTime: number | null;
    slot: number;
    err: unknown | null;
}
/**
 * Fetch signatures for an address
 */
export declare function fetchSignatures(account: AddressLike, limit?: number, before?: string): Promise<SignatureResult[]>;
/**
 * Find oldest signature by paginating backwards
 */
export declare function findOldestSignature(address: AddressLike): Promise<SignatureResult | null>;
/**
 * Find first (most recent) signature
 */
export declare function findFirstSignature(address: AddressLike): Promise<SignatureResult | null>;
/**
 * Get parsed transaction
 */
export declare function fetchParsedTransaction(signature: string): Promise<any | null>;
/**
 * Get raw transaction (base64)
 */
export declare function fetchRawTransaction(signature: string): Promise<any | null>;
/**
 * Fetch account info (base64)
 */
export declare function fetchAccount(account: AddressLike): Promise<{
    data: Buffer;
    owner: string;
} | null>;
/**
 * Parse bonding curve account data
 */
export declare function parseBondingCurveData(data: Buffer): BondingCurveDataResult | null;
/**
 * Fetch and parse bonding curve data
 */
export declare function fetchBondingCurveData(bondingCurveAddress: AddressLike): Promise<BondingCurveDataResult | null>;
