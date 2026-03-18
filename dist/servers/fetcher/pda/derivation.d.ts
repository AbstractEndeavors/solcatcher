import { PublicKey } from '@solana/web3.js';
import { DerivedPDAsResult } from './schemas.js';
import type { MintLike, AddressLike, BoolLike } from '@imports';
/**
 * Derive Metaplex metadata PDA for a mint
 *
 * Seeds: ["metadata", METADATA_PROGRAM_ID, mint]
 */
export declare function deriveMetadataPDA(mint: MintLike): PublicKey;
/**
 * Get metadata PDA as base58 string
 */
export declare function getMetadataPDAAddress(mint: MintLike): string;
/**
 * Derive pump.fun bonding curve PDA for a mint
 *
 * Seeds: ["bonding-curve", mint]
 */
export declare function deriveBondingCurvePDA(mint: MintLike, programId?: AddressLike): PublicKey;
/**
 * Get bonding curve PDA as base58 string
 */
export declare function getBondingCurvePDAAddress(mint: MintLike, programId?: AddressLike): string;
/**
 * Derive associated token account for bonding curve
 *
 * This is the ATA that holds the token reserves
 * Seeds: [bonding_curve, TOKEN_PROGRAM, mint]
 */
export declare function deriveAssociatedBondingCurvePDA(mint: MintLike, bonding_curve: MintLike, token_program?: AddressLike): PublicKey;
/**
 * Get associated bonding curve PDA as base58 string
 */
export declare function getAssociatedBondingCurvePDAAddress(mint: MintLike, bonding_curve: MintLike, token_program?: AddressLike): string;
/**
 * Derive all relevant PDAs for a pump.fun token
 *
 * Returns:
 * - metadata: Metaplex metgetPubKeyStringadata PDA
 * - bondingCurve: Pump.fun bonding curve PDA
 * - associatedBondingCurve: ATA for bonding curve (token reserves)
 */
export declare function deriveAllPDAs(mint: MintLike, program_id?: AddressLike, token_program?: AddressLike): DerivedPDAsResult;
/**
 * Check if mint uses Token-2022 program
 *
 * Pump.fun tokens created after a certain date use Token-2022
 */
export declare function isToken2022Mint(mintSuffix: string): BoolLike;
/**
 * Get appropriate token program for a mint
 */
export declare function getTokenProgramForMint(mint: MintLike): PublicKey;
/**
 * Derive all PDAs with auto-detected token program
 */
export declare function deriveAllPDAsAuto(mint: MintLike, program_id?: AddressLike): DerivedPDAsResult;
