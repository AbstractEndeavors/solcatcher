import { safeDivide, safeSubtract, safeAdd } from './imports.js';
/**
 * TRANSACTIONS SCHEMAS
 *
 * Explicit schema definitions - no ad-hoc objects.
 * Every field is accounted for, typed, and validated.
 *
 * Pattern: Schemas over ad-hoc objects
 */
// ============================================================
// DOMAIN MODEL (Read: full transaction row)
// ============================================================
export class TransactionsRow {
    id;
    log_id;
    pair_id;
    meta_id;
    signature;
    program_id;
    slot;
    invocation;
    mint;
    user_address;
    is_buy;
    ix_name;
    sol_amount;
    token_amount;
    virtual_sol_reserves;
    virtual_token_reserves;
    real_sol_reserves;
    real_token_reserves;
    mayhem_mode;
    price;
    track_volume;
    total_unclaimed_tokens;
    total_claimed_tokens;
    current_sol_volume;
    fee_recipient;
    fee_basis_points;
    fee;
    creator;
    creator_fee_basis_points;
    creator_fee;
    timestamp;
    last_update_timestamp;
    processed_at;
    created_at;
    updated_at;
    constructor(
    // Primary
    id, 
    // Provenance
    log_id, pair_id, meta_id, 
    // Canonical identity
    signature, 
    // Chain context
    program_id, slot, invocation, 
    // Asset context
    mint, user_address, 
    // Trade direction
    is_buy, ix_name, 
    // Amounts
    sol_amount, token_amount, 
    // AMM state
    virtual_sol_reserves, virtual_token_reserves, real_sol_reserves, real_token_reserves, mayhem_mode, 
    // Pricing
    price, 
    // Volume tracking
    track_volume, total_unclaimed_tokens, total_claimed_tokens, current_sol_volume, 
    // Fees
    fee_recipient, fee_basis_points, fee, 
    // Creator fees
    creator, creator_fee_basis_points, creator_fee, 
    // Time
    timestamp, last_update_timestamp, 
    // Lifecycle
    processed_at, created_at, updated_at) {
        this.id = id;
        this.log_id = log_id;
        this.pair_id = pair_id;
        this.meta_id = meta_id;
        this.signature = signature;
        this.program_id = program_id;
        this.slot = slot;
        this.invocation = invocation;
        this.mint = mint;
        this.user_address = user_address;
        this.is_buy = is_buy;
        this.ix_name = ix_name;
        this.sol_amount = sol_amount;
        this.token_amount = token_amount;
        this.virtual_sol_reserves = virtual_sol_reserves;
        this.virtual_token_reserves = virtual_token_reserves;
        this.real_sol_reserves = real_sol_reserves;
        this.real_token_reserves = real_token_reserves;
        this.mayhem_mode = mayhem_mode;
        this.price = price;
        this.track_volume = track_volume;
        this.total_unclaimed_tokens = total_unclaimed_tokens;
        this.total_claimed_tokens = total_claimed_tokens;
        this.current_sol_volume = current_sol_volume;
        this.fee_recipient = fee_recipient;
        this.fee_basis_points = fee_basis_points;
        this.fee = fee;
        this.creator = creator;
        this.creator_fee_basis_points = creator_fee_basis_points;
        this.creator_fee = creator_fee;
        this.timestamp = timestamp;
        this.last_update_timestamp = last_update_timestamp;
        this.processed_at = processed_at;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }
    // ──────────────────────────────────────────────────────
    // DERIVED STATE (No setters, pure computation)
    // ──────────────────────────────────────────────────────
    get isBuy() {
        return this.is_buy;
    }
    get isSell() {
        return !this.is_buy;
    }
    get isVolumeTracked() {
        return this.track_volume;
    }
    get isProcessed() {
        return this.processed_at !== null;
    }
    get isMayhemMode() {
        return this.mayhem_mode;
    }
    get effectivePrice() {
        return this.price;
    }
    get totalFees() {
        return safeAdd(Number(this.fee), Number(this.creator_fee));
    }
    get totalFeeBasisPoints() {
        return safeAdd(Number(this.fee_basis_points), Number(this.creator_fee_basis_points));
    }
    get netSolAmount() {
        // SOL amount minus fees
        return this.is_buy
            ? safeSubtract(this.sol_amount, Number(this.fee), Number(this.creator_fee))
            : this.sol_amount;
    }
    get slippage() {
        // Calculate slippage based on reserves
        // This is a simplified calculation
        const virtualPrice = Number(this.virtual_sol_reserves) / Number(this.virtual_token_reserves);
        const virtSub = safeSubtract(this.price, virtualPrice);
        const virtDiv = safeDivide(virtSub, virtualPrice);
        return Math.abs(virtDiv);
    }
}
// ============================================================
// OPERATION PARAMS (Write: explicit inputs)
// ============================================================
/**
 * Insert bonding curve transaction
 * Used when creating from curve events
 */
export class InsertCurveParams {
    signature;
    bonding_curve;
    associated_bonding_curve;
    mint;
    program_id;
    slot;
    user_address;
    genesis_signature;
    owner;
    constructor(signature, bonding_curve = null, associated_bonding_curve = null, mint = null, program_id = null, slot = null, user_address = null, genesis_signature = null, owner = null) {
        this.signature = signature;
        this.bonding_curve = bonding_curve;
        this.associated_bonding_curve = associated_bonding_curve;
        this.mint = mint;
        this.program_id = program_id;
        this.slot = slot;
        this.user_address = user_address;
        this.genesis_signature = genesis_signature;
        this.owner = owner;
    }
}
/**
 * Enrich with monotonic facts
 * Used to add chain/provenance data that never changes
 */
export class EnrichMonotonicParams {
    id;
    slot;
    program_id;
    user_address;
    log_id;
    meta_id;
    pair_id;
    constructor(id, slot = null, program_id = null, user_address = null, log_id = null, meta_id = null, pair_id = null) {
        this.id = id;
        this.slot = slot;
        this.program_id = program_id;
        this.user_address = user_address;
        this.log_id = log_id;
        this.meta_id = meta_id;
        this.pair_id = pair_id;
    }
}
/**
 * Append TCNs to event stream
 * Used to add new token change notifications
 */
export class AppendTcnsParams {
    id;
    tcns;
    constructor(id, tcns) {
        this.id = id;
        this.tcns = tcns;
        if (!Array.isArray(tcns)) {
            throw new Error('tcns must be an array');
        }
    }
    get serializedTcns() {
        return JSON.stringify(this.tcns);
    }
}
/**
 * Update TCNs (replace entire array)
 * Used when re-processing or fixing data
 */
export class UpdateTcnsParams {
    id;
    tcns;
    constructor(id, tcns) {
        this.id = id;
        this.tcns = tcns;
        if (!Array.isArray(tcns)) {
            throw new Error('tcns must be an array');
        }
    }
    get serializedTcns() {
        return JSON.stringify(this.tcns);
    }
}
/**
 * Mark transaction as processed
 */
export class MarkProcessedTransactionsParams {
    id;
    signature;
    constructor(id, signature) {
        this.id = id;
        this.signature = signature;
        if (!id && !signature) {
            throw new Error('Either id or signature must be provided');
        }
    }
}
/**
 * Mark multiple transactions as processed
 */
export class MarkProcessedBatchTransactionsParams {
    ids;
    signatures;
    constructor(ids, signatures) {
        this.ids = ids;
        this.signatures = signatures;
        if ((!ids || ids.length === 0) && (!signatures || signatures.length === 0)) {
            throw new Error('Either ids or signatures must be provided');
        }
    }
}
/**
 * Fetch parameters - unified query interface
 */
export class FetchTransactionsParams {
    id;
    signature;
    bonding_curve;
    limit;
    latest;
    unprocessed_only;
    constructor(id, signature, bonding_curve, limit, latest, unprocessed_only) {
        this.id = id;
        this.signature = signature;
        this.bonding_curve = bonding_curve;
        this.limit = limit;
        this.latest = latest;
        this.unprocessed_only = unprocessed_only;
    }
}
// ============================================================
// LEGACY COMPATIBILITY (Deprecated, will be removed)
// ============================================================
/**
 * @deprecated Use InsertCurveParams or EnrichMonotonicParams
 * This exists for backwards compatibility only
 */
export class UpsertTransactionsParams {
    signature;
    slot;
    program_id;
    user_address;
    log_id;
    meta_id;
    pair_id;
    tcns;
    constructor(signature, slot = null, program_id = null, user_address = null, log_id = null, meta_id = null, pair_id = null, tcns = []) {
        this.signature = signature;
        this.slot = slot;
        this.program_id = program_id;
        this.user_address = user_address;
        this.log_id = log_id;
        this.meta_id = meta_id;
        this.pair_id = pair_id;
        this.tcns = tcns;
    }
    get serializedTcns() {
        return JSON.stringify(this.tcns);
    }
}
/**
 * @deprecated Use InsertCurveParams with EnrichMonotonicParams
 */
export class IngestFromLogParams {
    signature;
    slot;
    program_id;
    user_address;
    log_id;
    meta_id;
    pair_id;
    constructor(signature, slot = null, program_id = null, user_address = null, log_id, meta_id = null, pair_id = null) {
        this.signature = signature;
        this.slot = slot;
        this.program_id = program_id;
        this.user_address = user_address;
        this.log_id = log_id;
        this.meta_id = meta_id;
        this.pair_id = pair_id;
    }
}
// ============================================================
// INSERT PARAMS (Write: explicit inputs)
// ============================================================
export class TransactionsInsertParams {
    log_id;
    pair_id;
    meta_id;
    signature;
    program_id;
    slot;
    invocation;
    mint;
    user_address;
    is_buy;
    ix_name;
    sol_amount;
    token_amount;
    virtual_sol_reserves;
    virtual_token_reserves;
    real_sol_reserves;
    real_token_reserves;
    mayhem_mode;
    price;
    track_volume;
    total_unclaimed_tokens;
    total_claimed_tokens;
    current_sol_volume;
    fee_recipient;
    fee_basis_points;
    fee;
    creator;
    creator_fee_basis_points;
    creator_fee;
    timestamp;
    last_update_timestamp;
    constructor(
    // Provenance
    log_id, pair_id, meta_id, 
    // Identity
    signature, 
    // Chain context
    program_id, slot, invocation, 
    // Asset context
    mint, user_address, 
    // Trade
    is_buy, ix_name, 
    // Amounts
    sol_amount, token_amount, 
    // AMM state
    virtual_sol_reserves, virtual_token_reserves, real_sol_reserves, real_token_reserves, mayhem_mode, 
    // Pricing
    price, 
    // Volume tracking
    track_volume, total_unclaimed_tokens, total_claimed_tokens, current_sol_volume, 
    // Fees
    fee_recipient, fee_basis_points, fee, 
    // Creator fees
    creator, creator_fee_basis_points, creator_fee, 
    // Time
    timestamp, last_update_timestamp) {
        this.log_id = log_id;
        this.pair_id = pair_id;
        this.meta_id = meta_id;
        this.signature = signature;
        this.program_id = program_id;
        this.slot = slot;
        this.invocation = invocation;
        this.mint = mint;
        this.user_address = user_address;
        this.is_buy = is_buy;
        this.ix_name = ix_name;
        this.sol_amount = sol_amount;
        this.token_amount = token_amount;
        this.virtual_sol_reserves = virtual_sol_reserves;
        this.virtual_token_reserves = virtual_token_reserves;
        this.real_sol_reserves = real_sol_reserves;
        this.real_token_reserves = real_token_reserves;
        this.mayhem_mode = mayhem_mode;
        this.price = price;
        this.track_volume = track_volume;
        this.total_unclaimed_tokens = total_unclaimed_tokens;
        this.total_claimed_tokens = total_claimed_tokens;
        this.current_sol_volume = current_sol_volume;
        this.fee_recipient = fee_recipient;
        this.fee_basis_points = fee_basis_points;
        this.fee = fee;
        this.creator = creator;
        this.creator_fee_basis_points = creator_fee_basis_points;
        this.creator_fee = creator_fee;
        this.timestamp = timestamp;
        this.last_update_timestamp = last_update_timestamp;
    }
    toArray() {
        return [
            this.log_id,
            this.pair_id,
            this.meta_id,
            this.signature,
            this.program_id,
            this.slot,
            this.invocation,
            this.mint,
            this.user_address,
            this.is_buy,
            this.ix_name,
            this.sol_amount,
            this.token_amount,
            this.virtual_sol_reserves,
            this.virtual_token_reserves,
            this.real_sol_reserves,
            this.real_token_reserves,
            this.mayhem_mode,
            this.price,
            this.track_volume,
            this.total_unclaimed_tokens,
            this.total_claimed_tokens,
            this.current_sol_volume,
            this.fee_recipient,
            this.fee_basis_points,
            this.fee,
            this.creator,
            this.creator_fee_basis_points,
            this.creator_fee,
            this.timestamp,
            this.last_update_timestamp
        ];
    }
}
// ============================================================
// BULK OPERATION PARAMS
// ============================================================
export class BulkTransactionsInsertParams {
    transactions;
    constructor(transactions) {
        this.transactions = transactions;
        if (transactions.length === 0) {
            throw new Error('BulkInsertParams: transactions array cannot be empty');
        }
    }
    get count() {
        return this.transactions.length;
    }
}
export class CreatorSignaturesParams {
    signatures;
    constructor(signatures) {
        this.signatures = signatures;
        if (signatures.length === 0) {
            throw new Error('CreatorSignaturesParams: signatures array cannot be empty');
        }
    }
    get count() {
        return this.signatures.length;
    }
}
