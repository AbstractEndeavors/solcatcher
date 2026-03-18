import { TransactionsInsertParams } from './schemas.js';
import { preProcessTradeEvent } from './imports.js';
// =============================================================================
// LAYER 3 → DB: To Insert Params
// =============================================================================
// =============================================================================
// BACKWARDS COMPATIBILITY
// =============================================================================
/**
 * Drop-in replacement for the old mapTradeEventToTransactionInsert.
 * Uses the new pipeline internally.
 *
 * @deprecated Use processTradeEvent() for new code.
 */
export function mapTradeEventToTransactionsInsert(params) {
    const result = preProcessTradeEvent(params.event, {
        signature: params.signature,
        slot: params.slot,
        program_id: params.program_id,
        invocation: params.invocation,
        log_id: params.log_id,
        pair_id: params.pair_id,
        meta_id: params.meta_id,
    });
    if (!result) {
        throw new Error(`mapTradeEventToTransactionsInsert: not a valid TradeEvent. ` +
            `name=${params.event.name}, category=${params.event.category}`);
    }
    return result.insertParams;
}
// =============================================================================
// DB-GATE VALIDATOR (strict, right before insert)
// =============================================================================
/**
 * Strict validation right before DB insert.
 * Catches type mismatches that would cause silent DB errors.
 */
export function isDbSafeInsertTransactionsParams(p) {
    if (!p || typeof p !== 'object')
        return false;
    const obj = p;
    // integer IDs
    const intIds = ['log_id', 'pair_id', 'meta_id', 'slot', 'invocation'];
    for (const k of intIds) {
        if (!Number.isInteger(obj[k]))
            return false;
    }
    // string fields (must be non-empty strings)
    const requiredStrings = [
        'signature', 'program_id', 'mint', 'user_address',
        'sol_amount', 'token_amount',
        'virtual_sol_reserves', 'virtual_token_reserves',
        'real_sol_reserves', 'real_token_reserves',
        'total_unclaimed_tokens', 'total_claimed_tokens', 'current_sol_volume',
        'fee_recipient', 'fee_basis_points', 'fee',
        'creator', 'creator_fee_basis_points', 'creator_fee'
    ];
    for (const k of requiredStrings) {
        if (typeof obj[k] !== 'string' || obj[k] === '')
            return false;
    }
    // numeric string validation (must parse to valid number)
    const numericStrings = [
        'sol_amount', 'token_amount',
        'virtual_sol_reserves', 'virtual_token_reserves',
        'real_sol_reserves', 'real_token_reserves',
        'total_unclaimed_tokens', 'total_claimed_tokens', 'current_sol_volume',
        'fee_basis_points', 'fee',
        'creator_fee_basis_points', 'creator_fee'
    ];
    for (const k of numericStrings) {
        const val = obj[k];
        if (!/^-?\d+$/.test(val))
            return false; // must be integer string
    }
    // boolean fields
    if (typeof obj.is_buy !== 'boolean')
        return false;
    if (typeof obj.mayhem_mode !== 'boolean')
        return false;
    if (typeof obj.track_volume !== 'boolean')
        return false;
    // ix_name enum
    if (obj.ix_name !== 'buy' && obj.ix_name !== 'sell')
        return false;
    // price (finite number)
    if (typeof obj.price !== 'number' || !Number.isFinite(obj.price))
        return false;
    // timestamps (safe integers)
    if (!Number.isSafeInteger(obj.timestamp))
        return false;
    if (!Number.isSafeInteger(obj.last_update_timestamp))
        return false;
    return true;
}
export function toDbInsertParams(dto) {
    return new TransactionsInsertParams(dto.log_id, dto.pair_id, dto.meta_id, dto.signature, dto.program_id, dto.slot, dto.invocation, dto.mint, dto.user_address, dto.is_buy, dto.ix_name, dto.sol_amount, dto.token_amount, dto.virtual_sol_reserves, dto.virtual_token_reserves, dto.real_sol_reserves, dto.real_token_reserves, dto.mayhem_mode, dto.price, dto.track_volume, dto.total_unclaimed_tokens, dto.total_claimed_tokens, dto.current_sol_volume, dto.fee_recipient, dto.fee_basis_points, dto.fee, dto.creator, dto.creator_fee_basis_points, dto.creator_fee, dto.timestamp, dto.last_update_timestamp);
}
