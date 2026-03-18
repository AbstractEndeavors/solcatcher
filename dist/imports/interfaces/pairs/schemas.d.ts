import type { IdLike, MintLike, AddressLike, SigLike, Bool, IntLike, StringLike } from '@imports';
/**
 * Row shape - what comes out of the database.
 */
export declare class PairRow {
    readonly id: number;
    readonly mint: string;
    readonly program_id: string;
    readonly token_program: string;
    readonly bonding_curve: string;
    readonly associated_bonding_curve: StringLike;
    readonly creator: string;
    readonly signature: StringLike;
    readonly metaplex: StringLike;
    readonly virtual_token_reserves: any;
    readonly virtual_sol_reserves: any;
    readonly real_token_reserves: any;
    readonly token_total_supply: any;
    readonly log_id: IdLike;
    readonly txn_id: IdLike;
    readonly meta_id: IdLike;
    readonly tcns: number[];
    readonly slot: IntLike;
    readonly timestamp: Date;
    readonly created_at: Date;
    readonly updated_at: Date;
    readonly processed_at: Date | null;
    constructor(id: number, mint: string, program_id: string, token_program: string, bonding_curve: string, associated_bonding_curve: StringLike, creator: string, signature: StringLike, metaplex: StringLike, virtual_token_reserves: any, virtual_sol_reserves: any, real_token_reserves: any, token_total_supply: any, log_id: IdLike, txn_id: IdLike, meta_id: IdLike, tcns: number[], slot: IntLike, timestamp: Date, created_at: Date, updated_at: Date, processed_at: Date | null);
}
export declare class PairEnrichmentRow {
    id: number;
    mint: AddressLike;
    program_id: AddressLike;
    token_program: AddressLike;
    bonding_curve: AddressLike;
    associated_bonding_curve: AddressLike;
    creator: AddressLike;
    signature: SigLike;
    metaplex: AddressLike;
    virtual_token_reserves: bigint;
    virtual_sol_reserves: bigint;
    real_token_reserves: bigint;
    token_total_supply: bigint;
    log_id: IdLike;
    txn_id: IdLike;
    meta_id: IdLike;
    tcns: number[];
    slot: IntLike;
    timestamp: Date;
    created_at: Date;
    updated_at: Date;
    processed_at: Date | null;
    constructor(id: number, mint: AddressLike, program_id: AddressLike, token_program: AddressLike, bonding_curve: AddressLike, associated_bonding_curve: AddressLike, creator: AddressLike, signature: SigLike, metaplex: AddressLike, virtual_token_reserves: bigint, virtual_sol_reserves: bigint, real_token_reserves: bigint, token_total_supply: bigint, log_id: IdLike, txn_id: IdLike, meta_id: IdLike, tcns: number[], slot: IntLike, timestamp: Date, created_at: Date, updated_at: Date, processed_at: Date | null);
}
/**
 * CreateEvent shape - what arrives from the websocket.
 * 1:1 mapping, no transformation.
 */
export interface CreateEventData {
    readonly name: string;
    readonly symbol: string;
    readonly uri: string;
    readonly mint: string;
    readonly token_program: string;
    readonly bonding_curve: string;
    readonly user: string;
    readonly creator: string;
    readonly timestamp: Date;
    readonly virtual_token_reserves: any;
    readonly virtual_sol_reserves: any;
    readonly real_token_reserves: any;
    readonly token_total_supply: any;
    readonly is_mayhem_mode: boolean;
}
/**
 * Insert params - what goes into the database at genesis.
 * All bigints pre-converted to strings for NUMERIC columns.
 */
export interface InsertPairParams {
    mint: MintLike;
    program_id: AddressLike;
    token_program: AddressLike;
    bonding_curve: AddressLike;
    creator: AddressLike;
    timestamp: Date;
    virtual_token_reserves?: any;
    virtual_sol_reserves?: any;
    real_token_reserves?: any;
    token_total_supply?: any;
    associated_bonding_curve?: AddressLike;
    signature?: SigLike;
    log_id?: IdLike;
    txn_id?: IdLike;
    meta_id?: IdLike;
}
export interface PairInsertData {
    mint?: MintLike;
    program_id?: AddressLike;
    token_program?: AddressLike;
    bonding_curve?: AddressLike;
    creator?: AddressLike;
    virtual_token_reserves?: any;
    virtual_sol_reserves?: any;
    real_token_reserves?: any;
    token_total_supply?: any;
    associated_bonding_curve?: AddressLike;
    signature?: SigLike;
    log_id?: IdLike;
    txn_id?: IdLike;
    meta_id?: IdLike;
    slot?: IntLike;
    timestamp?: Date;
}
export interface PairUpsertData {
    id?: IdLike;
    mint?: MintLike;
    program_id?: AddressLike;
    token_program?: AddressLike;
    bonding_curve?: AddressLike;
    creator?: AddressLike;
    virtual_token_reserves?: any;
    virtual_sol_reserves?: any;
    real_token_reserves?: any;
    token_total_supply?: any;
    associated_bonding_curve?: AddressLike;
    signature?: SigLike;
    log_id?: IdLike;
    txn_id?: IdLike;
    meta_id?: IdLike;
    slot?: IntLike;
    timestamp?: Date;
}
/**
 * Enrichment params - post-genesis additions.
 */
export interface EnrichPairParams {
    log_id?: IdLike;
    txn_id?: IdLike;
    meta_id?: IdLike;
    signature?: SigLike;
    associated_bonding_curve?: AddressLike;
}
/**
 * Factory: CreateEventData → InsertPairParams
 * Pure mapping, no side effects.
 */
export declare function createEventToInsertParams(event: CreateEventData, context: {
    program_id: AddressLike;
    signature?: SigLike;
    meta_id?: IdLike;
    log_id?: IdLike;
    associated_bonding_curve?: AddressLike;
}): InsertPairParams;
export declare class PairRollup {
    readonly pair_id: IdLike;
    readonly total_sol_volume: any;
    readonly total_token_volume: any;
    readonly updated_at: any;
    constructor(pair_id: IdLike, total_sol_volume: any, total_token_volume: any, updated_at: any);
    get hasSolVolume(): Bool;
    get hasTokenVolume(): Bool;
    get isStale(): Bool;
}
export declare class UpsertPairRollupParams {
    readonly pair_id: IdLike;
    readonly total_sol_volume: any;
    readonly total_token_volume: any;
    constructor(pair_id: IdLike, total_sol_volume: any, total_token_volume: any);
}
