// src/db/repositories/repos/pairs/schemas.ts
import { safeMultiply, safeSubtract } from './imports.js';
/**
 * Row shape - what comes out of the database.
 */
export class PairRow {
    id;
    mint;
    program_id;
    token_program;
    bonding_curve;
    associated_bonding_curve;
    creator;
    signature;
    metaplex;
    virtual_token_reserves;
    virtual_sol_reserves;
    real_token_reserves;
    token_total_supply;
    log_id;
    txn_id;
    meta_id;
    tcns;
    slot;
    timestamp;
    created_at;
    updated_at;
    processed_at;
    constructor(id, mint, program_id, token_program, bonding_curve, associated_bonding_curve, creator, signature, metaplex, virtual_token_reserves, virtual_sol_reserves, real_token_reserves, token_total_supply, log_id, txn_id, meta_id, tcns, slot, timestamp, created_at, updated_at, processed_at) {
        this.id = id;
        this.mint = mint;
        this.program_id = program_id;
        this.token_program = token_program;
        this.bonding_curve = bonding_curve;
        this.associated_bonding_curve = associated_bonding_curve;
        this.creator = creator;
        this.signature = signature;
        this.metaplex = metaplex;
        this.virtual_token_reserves = virtual_token_reserves;
        this.virtual_sol_reserves = virtual_sol_reserves;
        this.real_token_reserves = real_token_reserves;
        this.token_total_supply = token_total_supply;
        this.log_id = log_id;
        this.txn_id = txn_id;
        this.meta_id = meta_id;
        this.tcns = tcns;
        this.slot = slot;
        this.timestamp = timestamp;
        this.created_at = created_at;
        this.updated_at = updated_at;
        this.processed_at = processed_at;
    }
}
export class PairEnrichmentRow {
    id;
    mint;
    program_id;
    token_program;
    bonding_curve;
    associated_bonding_curve;
    creator;
    signature;
    metaplex;
    virtual_token_reserves;
    virtual_sol_reserves;
    real_token_reserves;
    token_total_supply;
    log_id;
    txn_id;
    meta_id;
    tcns;
    slot;
    timestamp;
    created_at;
    updated_at;
    processed_at;
    constructor(id, mint, program_id, token_program, bonding_curve, associated_bonding_curve, creator, signature, metaplex, virtual_token_reserves, virtual_sol_reserves, real_token_reserves, token_total_supply, log_id, txn_id, meta_id, tcns, slot, timestamp, created_at, updated_at, processed_at) {
        this.id = id;
        this.mint = mint;
        this.program_id = program_id;
        this.token_program = token_program;
        this.bonding_curve = bonding_curve;
        this.associated_bonding_curve = associated_bonding_curve;
        this.creator = creator;
        this.signature = signature;
        this.metaplex = metaplex;
        this.virtual_token_reserves = virtual_token_reserves;
        this.virtual_sol_reserves = virtual_sol_reserves;
        this.real_token_reserves = real_token_reserves;
        this.token_total_supply = token_total_supply;
        this.log_id = log_id;
        this.txn_id = txn_id;
        this.meta_id = meta_id;
        this.tcns = tcns;
        this.slot = slot;
        this.timestamp = timestamp;
        this.created_at = created_at;
        this.updated_at = updated_at;
        this.processed_at = processed_at;
    }
}
/**
 * Factory: CreateEventData → InsertPairParams
 * Pure mapping, no side effects.
 */
export function createEventToInsertParams(event, context) {
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
    pair_id;
    total_sol_volume;
    total_token_volume;
    updated_at;
    constructor(pair_id, total_sol_volume, total_token_volume, updated_at) {
        this.pair_id = pair_id;
        this.total_sol_volume = total_sol_volume;
        this.total_token_volume = total_token_volume;
        this.updated_at = updated_at;
    }
    get hasSolVolume() {
        return this.total_sol_volume !== null && this.total_sol_volume > 0n;
    }
    get hasTokenVolume() {
        return this.total_token_volume !== null && this.total_token_volume > 0n;
    }
    get isStale() {
        if (!this.updated_at)
            return true;
        const now = new Date();
        const staleThreshold = safeMultiply(5, 60, 1000); // 5 minutes
        const thresholdSub = safeSubtract(now.getTime(), this.updated_at.getTime());
        return thresholdSub > staleThreshold;
    }
}
// ============================================================
// ROLLUP PARAMS
// ============================================================
export class UpsertPairRollupParams {
    pair_id;
    total_sol_volume;
    total_token_volume;
    constructor(pair_id, total_sol_volume, total_token_volume) {
        this.pair_id = pair_id;
        this.total_sol_volume = total_sol_volume;
        this.total_token_volume = total_token_volume;
    }
}
