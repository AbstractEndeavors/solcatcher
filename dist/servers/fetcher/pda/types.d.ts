import type { SigLike, AddressLike, MintLike, IntLike } from '@imports';
export interface DerivedPDAs {
    /** Token mint address */
    mint: MintLike;
    /** Metaplex metadata PDA */
    metaplex: AddressLike;
    /** Pump.fun bonding curve PDA */
    bonding_curve: AddressLike;
    /** Associated token account for bonding curve */
    associated_bonding_curve: AddressLike;
    /** Program ID used for derivation */
    program_id: AddressLike;
}
export interface BondingCurveData {
    mint: MintLike;
    creator: AddressLike;
    virtual_token_reserves: bigint;
    virtual_sol_reserves: bigint;
    real_token_reserves: bigint;
    real_sol_reserves: bigint;
    token_total_supply: bigint;
    is_complete: boolean;
    token_program: AddressLike;
}
export interface GenesisInfo {
    /** Genesis transaction signature */
    signature: SigLike;
    /** Block time (unix timestamp) */
    block_time: IntLike;
    /** Slot number */
    slot: IntLike;
    /** Token creator address */
    creator: AddressLike;
    /** Resolution source */
    source: 'metadata_pda' | 'bonding_curve' | 'mint_account';
}
export interface TokenPDAInfo {
    /** All derived PDAs */
    pdas: DerivedPDAs;
    /** On-chain bonding curve data (if fetched) */
    bonding_curve_data: BondingCurveData | null;
    /** Genesis info (if resolved) */
    genesis: GenesisInfo | null;
}
