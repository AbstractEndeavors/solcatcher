import { PublicKey } from '@solana/web3.js';
import type { DerivedPDAs, BondingCurveData, GenesisInfo, TokenPDAInfo } from './types.js';
import type { MintLike, AddressLike, SigLike, IntLike } from '@imports';
declare abstract class Schema {
    constructor();
    protected abstract validate(): void;
}
export declare class MintParam extends Schema {
    readonly pubkey: PublicKey;
    readonly address: AddressLike;
    constructor(mint: AddressLike);
    protected validate(): void;
}
export declare class ProgramParam extends Schema {
    readonly pubkey: PublicKey;
    readonly address: AddressLike;
    constructor(program_id: AddressLike | PublicKey);
    protected validate(): void;
}
export declare class DerivedPDAsResult implements DerivedPDAs {
    readonly mint: MintLike;
    readonly metaplex: AddressLike;
    readonly bonding_curve: AddressLike;
    readonly associated_bonding_curve: AddressLike;
    readonly program_id: AddressLike;
    readonly token_program: AddressLike;
    constructor(mint: MintLike, metaplex: AddressLike, bonding_curve: AddressLike, associated_bonding_curve: AddressLike, program_id: AddressLike, token_program: AddressLike);
    toJSON(): DerivedPDAs;
}
export declare class BondingCurveDataResult implements BondingCurveData {
    readonly mint: MintLike;
    readonly creator: AddressLike;
    readonly virtual_token_reserves: bigint;
    readonly virtual_sol_reserves: bigint;
    readonly real_token_reserves: bigint;
    readonly real_sol_reserves: bigint;
    readonly token_total_supply: bigint;
    readonly is_complete: boolean;
    readonly token_program: AddressLike;
    constructor(mint: MintLike, creator: AddressLike, virtual_token_reserves: bigint, virtual_sol_reserves: bigint, real_token_reserves: bigint, real_sol_reserves: bigint, token_total_supply: bigint, is_complete: boolean, token_program: AddressLike);
    toJSON(): Record<string, unknown>;
}
export declare class GenesisInfoResult implements GenesisInfo {
    readonly signature: SigLike;
    readonly block_time: IntLike;
    readonly slot: IntLike;
    readonly creator: AddressLike;
    readonly source: 'metadata_pda' | 'bonding_curve' | 'mint_account';
    constructor(signature: SigLike, block_time: IntLike, slot: IntLike, creator: AddressLike, source: 'metadata_pda' | 'bonding_curve' | 'mint_account');
    toJSON(): GenesisInfo;
}
export declare class TokenPDAInfoResult implements TokenPDAInfo {
    readonly pdas: DerivedPDAsResult;
    readonly bonding_curve_data: BondingCurveDataResult | null;
    readonly genesis: GenesisInfoResult | null;
    constructor(pdas: DerivedPDAsResult, bonding_curve_data: BondingCurveDataResult | null, genesis: GenesisInfoResult | null);
    toJSON(): Record<string, unknown>;
}
export {};
