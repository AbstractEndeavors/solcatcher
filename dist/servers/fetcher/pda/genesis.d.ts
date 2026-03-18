import { GenesisInfoResult } from './schemas.js';
import type { MintLike, AddressLike } from '@imports';
import { PublicKey } from '@solana/web3.js';
/**
 * Check if instruction is Metaplex metadata init
 */
export declare function isMetaplexMetadataInit(ix: any): boolean;
/**
 * Check if instruction is pump.fun create
 */
export declare function isPumpFunCreate(ix: any, program_id: AddressLike): boolean;
/**
 * Extract creator from parsed transaction
 */
export declare function extractCreator(tx: any, program_id: AddressLike): string | null;
/**
 * Strategy 1: Metadata PDA (fast - few signatures)
 */
export declare function tryMetadataPDA(mint: MintLike, program_id: AddressLike): Promise<GenesisInfoResult | null>;
/**
 * Strategy 2: Bonding Curve PDA (canonical for pump.fun)
 */
export declare function tryBondingCurvePDA(mint: MintLike, program_id: AddressLike): Promise<GenesisInfoResult | null>;
/**
 * Strategy 3: Mint Account (fallback - slowest)
 */
export declare function tryMintAccount(mint: MintLike, program_id: AddressLike): Promise<GenesisInfoResult | null>;
/**
 * Quick genesis resolution - metadata PDA only (fast)
 */
export declare function resolveGenesisQuick(mint: MintLike, program_id?: AddressLike): Promise<GenesisInfoResult | null>;
/**
 * Full genesis resolution - all strategies
 *
 * Order:
 * 1. Metadata PDA (fast)
 * 2. Bonding Curve PDA (canonical)
 * 3. Mint Account (fallback)
 */
export declare function resolveGenesisFull(mint: MintLike, program_id?: AddressLike): Promise<GenesisInfoResult | null>;
/**
 * Resolve genesis with bonding curve priority
 *
 * For pump.fun tokens, bonding curve is more canonical
 */
export declare function resolveGenesisBondingCurveFirst(mint: MintLike, program_id?: AddressLike): Promise<GenesisInfoResult | null>;
export declare const METAPLEX_PROGRAM_ID: PublicKey;
export declare function getMetadataPda(mint: any): PublicKey;
export declare function getFirstTx(account: any): Promise<SigDict | null>;
export interface SigDict {
    blockTime: number;
    confirmationStatus: string;
    err: any;
    memo: any;
    signature: string;
    slot: number;
}
export declare function getTokenCreationInfo(mint: string): Promise<any>;
