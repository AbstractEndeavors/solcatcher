import type { PrecisePrice, IntLike, SigLike, IdLike, MintLike, AddressLike, InsertPairParams } from './imports.js';
import { EventKind, type DecodeProvenance } from '@imports';
/**
 * Raw decoded output from CreateEvent.
 * All values as they come off the wire - bigints stay bigints.
 * No computation happens here.
 */
export interface DecodedCreateEvent {
    discriminato?: any;
    name: string;
    symbol: string;
    uri: string;
    description: string;
    slot?: IntLike;
    mint: MintLike;
    bonding_curve: AddressLike;
    token_program: AddressLike;
    user: string | null;
    creator: string | null;
    virtual_token_reserves: bigint;
    virtual_sol_reserves: bigint;
    real_token_reserves: bigint;
    token_total_supply: bigint;
    timestamp: Date;
    is_mayhem_mode: boolean;
}
export interface DecodedCreateEvents extends DecodedCreateEvent {
    readonly kind: typeof EventKind.CREATE;
    readonly provenance: DecodeProvenance;
    /** Raw decoded data for passthrough */
    readonly raw: Record<string, unknown>;
}
export interface CreateEnrichmentContext {
    signature?: SigLike;
    slot?: IntLike;
    program_id?: AddressLike;
    invocation?: IntLike;
    log_id?: IdLike;
    meta_id?: IdLike;
    txn_id?: IdLike;
    bonding_curve?: AddressLike;
    associated_bonding_curve?: AddressLike;
}
/**
 * Enriched create event with computed values.
 * Keeps reference to original decoded data for audit trail.
 */
export interface EnrichedCreateEvent extends CreateEnrichmentContext {
    decoded: DecodedCreateEvents;
    initial_price: PrecisePrice;
    timestamp: Date;
    metadata: {
        mint: MintLike;
        name: string;
        symbol: string;
        discriminator?: string;
        uri: string;
        user_address?: AddressLike;
        creator?: AddressLike;
        signature?: SigLike;
        bonding_curve?: AddressLike;
        associated_bonding_curve?: AddressLike;
        program_id?: AddressLike;
        timestamp?: Date | null;
    };
}
export interface CreatePipelineContext extends CreateEnrichmentContext {
}
export interface CreatePipelineResult {
    decoded: DecodedCreateEvents;
    enriched: EnrichedCreateEvent;
    insertParams: InsertPairParams;
}
