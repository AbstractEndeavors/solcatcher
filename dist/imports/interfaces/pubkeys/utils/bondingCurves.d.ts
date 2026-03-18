import type { BondingCurveSpec } from './../types.js';
import type { MintLike, AddressLike } from './imports.js';
export declare function deriveBondingCurve(mint: MintLike, programId: AddressLike): Promise<any>;
/**
 * Derive the associated bonding curve for a given bonding curve and mint.
 */
export declare function deriveAssociatedBondingCurve(bondingCurve: AddressLike, mint: MintLike): Promise<any>;
/**
 * Derive both bonding curve and associated bonding curve for a given mint and program ID.
 */
export declare function deriveBondingCurves(mint: MintLike, programId: AddressLike): Promise<{
    bondingCurve: string;
    associatedBondingCurve: string;
}>;
export declare function bondingCurveSpec(mint: MintLike, program_id?: AddressLike, bonding_curve?: AddressLike, associated_bonding_curve?: AddressLike): Promise<BondingCurveSpec>;
