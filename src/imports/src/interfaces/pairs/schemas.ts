// src/db/repositories/repos/pairs/schemas.ts

import type { IdLike, MintLike, AddressLike, SigLike,Bool,BigInt,DateLike,IntLike,StringLike } from '@imports';
import {safeMultiply,safeSubtract} from './imports.js';
/**
 * Row shape - what comes out of the database.
 */
export class PairRow {
  constructor(
    public id: number,
    public mint: MintLike,
    public program_id: AddressLike,
    public token_program: AddressLike,
    public bonding_curve: AddressLike,
    public associated_bonding_curve: AddressLike,
    public creator: AddressLike,
    public signature: SigLike,
    public metaplex: AddressLike,
    public virtual_token_reserves: any,
    public virtual_sol_reserves: any,
    public real_token_reserves: any,
    public token_total_supply: any,
    public log_id: IdLike,
    public txn_id: IdLike,
    public meta_id: IdLike,
    public tcns: number[],
    public slot: IntLike,
    public status: string,
    public timestamp: Date,
    public last_fetch:Date,
    public created_at: Date,
    public updated_at: Date,
    public processed_at: Date | null,
  ) {}
}
export class PairEnrichmentRow {
  constructor(
    public id: number,
    public mint: AddressLike,
    public program_id: AddressLike,
    public token_program: AddressLike,
    public bonding_curve: AddressLike,
    public associated_bonding_curve: AddressLike,
    public creator: AddressLike,
    public signature: SigLike,
    public metaplex: AddressLike,
    public virtual_token_reserves: bigint,
    public virtual_sol_reserves: bigint,
    public real_token_reserves: bigint,
    public token_total_supply: bigint,
    public log_id: IdLike,
    public txn_id: IdLike,
    public meta_id: IdLike,
    public tcns: number[],
    public slot: IntLike,
    public status: string,
    public timestamp: Date,
    public last_fetch:Date,
    public created_at: Date,
    public updated_at: Date,
    public processed_at: Date | null
  ) {}
}

/**
 * CreateEvent shape - what arrives from the websocket.
 * 1:1 mapping, no transformation.
 */
export interface CreateEventData {
  readonly name: string;
  readonly symbol: string;
  readonly uri: string;
  readonly mint: MintLike;
  readonly token_program: AddressLike;
  readonly bonding_curve: AddressLike;
  readonly user: AddressLike;
  readonly creator: AddressLike;
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
  // identity
  mint: MintLike;
  program_id: AddressLike;
  token_program: AddressLike;
  bonding_curve: AddressLike;
  creator: AddressLike;
  timestamp: Date;

  // genesis reserves (strings for NUMERIC)
  virtual_token_reserves?: any;
  virtual_sol_reserves?: any;
  real_token_reserves?: any;
  token_total_supply?: any;
  // optional at genesis
  associated_bonding_curve?: AddressLike;
  slot?: IntLike;
  signature?: SigLike;
  discriminator?:StringLike;
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
    id?:IdLike
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
export function createEventToInsertParams(
  event: CreateEventData,
  context: {
    program_id: AddressLike;
    signature?: SigLike;
    meta_id?: IdLike;
    log_id?: IdLike;
    associated_bonding_curve?: AddressLike;
  }
): InsertPairParams {
  return {
    mint: event.mint,
    program_id: context.program_id,
    token_program: event.token_program,
    bonding_curve: event.bonding_curve,
    creator: event.creator,
    virtual_token_reserves: event.virtual_token_reserves,
    virtual_sol_reserves: event.virtual_sol_reserves,
    real_token_reserves: event.real_token_reserves,
    token_total_supply: event.token_total_supply,
    timestamp: event.timestamp,
    associated_bonding_curve: context.associated_bonding_curve,
    signature: context.signature,
    meta_id: context.meta_id,
    log_id: context.log_id,
  };
}

// ============================================================
// PAIR ROLLUPS (Materialized aggregates)
// ============================================================

export class PairRollup {
  constructor(
    public readonly pair_id: IdLike,
    public readonly total_sol_volume: any,
    public readonly total_token_volume: any,
    public readonly updated_at: any
  ) {}
  get hasSolVolume(): Bool {
    return this.total_sol_volume !== null && this.total_sol_volume as BigInt > 0n;
  }

  get hasTokenVolume(): Bool {
    return this.total_token_volume !== null && this.total_token_volume as BigInt > 0n;
  }

  get isStale(): Bool {
    if (!this.updated_at) return true;
    const now = new Date();
    const staleThreshold = safeMultiply(5,60,1000); // 5 minutes
    const thresholdSub = safeSubtract(now.getTime(),this.updated_at.getTime())
    return thresholdSub > staleThreshold;
  }
}
// ============================================================
// ROLLUP PARAMS
// ============================================================

export class UpsertPairRollupParams {
  constructor(
    public readonly pair_id: IdLike,
    public readonly total_sol_volume: any,
    public readonly total_token_volume: any
  ) {}
}
