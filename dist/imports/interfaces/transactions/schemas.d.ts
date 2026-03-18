import type { IntLike, IdLike, MintLike, AddressLike, BigIntLike, BoolLike, LimitLike, DateLike, SigLike, TradeInstruction } from './imports.js';
/**
 * TRANSACTIONS SCHEMAS
 *
 * Explicit schema definitions - no ad-hoc objects.
 * Every field is accounted for, typed, and validated.
 *
 * Pattern: Schemas over ad-hoc objects
 */
export declare class TransactionsRow {
    readonly id: IdLike;
    readonly log_id: IdLike;
    readonly pair_id: IdLike;
    readonly meta_id: IdLike;
    readonly signature: SigLike;
    readonly program_id: AddressLike;
    readonly slot: IntLike;
    readonly invocation: IntLike;
    readonly mint: MintLike;
    readonly user_address: AddressLike;
    readonly is_buy: BoolLike;
    readonly ix_name: TradeInstruction;
    readonly sol_amount: IntLike;
    readonly token_amount: IntLike;
    readonly virtual_sol_reserves: BigIntLike;
    readonly virtual_token_reserves: BigIntLike;
    readonly real_sol_reserves: BigIntLike;
    readonly real_token_reserves: BigIntLike;
    readonly mayhem_mode: BoolLike;
    readonly price: IntLike;
    readonly track_volume: BoolLike;
    readonly total_unclaimed_tokens: BigIntLike;
    readonly total_claimed_tokens: BigIntLike;
    readonly current_sol_volume: BigIntLike;
    readonly fee_recipient: string;
    readonly fee_basis_points: BigIntLike;
    readonly fee: BigIntLike;
    readonly creator: string;
    readonly creator_fee_basis_points: BigIntLike;
    readonly creator_fee: BigIntLike;
    readonly timestamp: IntLike;
    readonly last_update_timestamp: IntLike;
    readonly processed_at: DateLike;
    readonly created_at: Date;
    readonly updated_at: Date;
    constructor(id: IdLike, log_id: IdLike, pair_id: IdLike, meta_id: IdLike, signature: SigLike, program_id: AddressLike, slot: IntLike, invocation: IntLike, mint: MintLike, user_address: AddressLike, is_buy: BoolLike, ix_name: TradeInstruction, sol_amount: IntLike, token_amount: IntLike, virtual_sol_reserves: BigIntLike, virtual_token_reserves: BigIntLike, real_sol_reserves: BigIntLike, real_token_reserves: BigIntLike, mayhem_mode: BoolLike, price: IntLike, track_volume: BoolLike, total_unclaimed_tokens: BigIntLike, total_claimed_tokens: BigIntLike, current_sol_volume: BigIntLike, fee_recipient: string, fee_basis_points: BigIntLike, fee: BigIntLike, creator: string, creator_fee_basis_points: BigIntLike, creator_fee: BigIntLike, timestamp: IntLike, last_update_timestamp: IntLike, processed_at: DateLike, created_at: Date, updated_at: Date);
    get isBuy(): BoolLike;
    get isSell(): BoolLike;
    get isVolumeTracked(): BoolLike;
    get isProcessed(): BoolLike;
    get isMayhemMode(): BoolLike;
    get effectivePrice(): IntLike;
    get totalFees(): number;
    get totalFeeBasisPoints(): number;
    get netSolAmount(): IntLike;
    get slippage(): IntLike;
}
/**
 * Insert bonding curve transaction
 * Used when creating from curve events
 */
export declare class InsertCurveParams {
    readonly signature: string;
    readonly bonding_curve: string | null;
    readonly associated_bonding_curve: string | null;
    readonly mint: string | null;
    readonly program_id: string | null;
    readonly slot: number | null;
    readonly user_address: string | null;
    readonly genesis_signature: string | null;
    readonly owner: string | null;
    constructor(signature: string, bonding_curve?: string | null, associated_bonding_curve?: string | null, mint?: string | null, program_id?: string | null, slot?: number | null, user_address?: string | null, genesis_signature?: string | null, owner?: string | null);
}
/**
 * Enrich with monotonic facts
 * Used to add chain/provenance data that never changes
 */
export declare class EnrichMonotonicParams {
    readonly id: IdLike;
    readonly slot: number | null;
    readonly program_id: string | null;
    readonly user_address: string | null;
    readonly log_id: IdLike | null;
    readonly meta_id: IdLike | null;
    readonly pair_id: IdLike | null;
    constructor(id: IdLike, slot?: number | null, program_id?: string | null, user_address?: string | null, log_id?: IdLike | null, meta_id?: IdLike | null, pair_id?: IdLike | null);
}
/**
 * Append TCNs to event stream
 * Used to add new token change notifications
 */
export declare class AppendTcnsParams {
    readonly id: IdLike;
    readonly tcns: unknown[];
    constructor(id: IdLike, tcns: unknown[]);
    get serializedTcns(): string;
}
/**
 * Update TCNs (replace entire array)
 * Used when re-processing or fixing data
 */
export declare class UpdateTcnsParams {
    readonly id: IdLike;
    readonly tcns: unknown[];
    constructor(id: IdLike, tcns: unknown[]);
    get serializedTcns(): string;
}
/**
 * Mark transaction as processed
 */
export declare class MarkProcessedTransactionsParams {
    readonly id?: IdLike;
    readonly signature?: SigLike;
    constructor(id?: IdLike, signature?: SigLike);
}
/**
 * Mark multiple transactions as processed
 */
export declare class MarkProcessedBatchTransactionsParams {
    readonly ids?: IdLike[] | undefined;
    readonly signatures?: SigLike[] | undefined;
    constructor(ids?: IdLike[] | undefined, signatures?: SigLike[] | undefined);
}
/**
 * Fetch parameters - unified query interface
 */
export declare class FetchTransactionsParams {
    readonly id?: IdLike;
    readonly signature?: SigLike;
    readonly bonding_curve?: string | undefined;
    readonly limit?: LimitLike;
    readonly latest?: BoolLike;
    readonly unprocessed_only?: boolean | undefined;
    constructor(id?: IdLike, signature?: SigLike, bonding_curve?: string | undefined, limit?: LimitLike, latest?: BoolLike, unprocessed_only?: boolean | undefined);
}
/**
 * @deprecated Use InsertCurveParams or EnrichMonotonicParams
 * This exists for backwards compatibility only
 */
export declare class UpsertTransactionsParams {
    readonly signature: string;
    readonly slot: number | null;
    readonly program_id: string | null;
    readonly user_address: string | null;
    readonly log_id: IdLike | null;
    readonly meta_id: IdLike | null;
    readonly pair_id: IdLike | null;
    readonly tcns: unknown[];
    constructor(signature: string, slot?: number | null, program_id?: string | null, user_address?: string | null, log_id?: IdLike | null, meta_id?: IdLike | null, pair_id?: IdLike | null, tcns?: unknown[]);
    get serializedTcns(): string;
}
/**
 * @deprecated Use InsertCurveParams with EnrichMonotonicParams
 */
export declare class IngestFromLogParams {
    readonly signature: string;
    readonly slot: number | null;
    readonly program_id: string | null;
    readonly user_address: string | null;
    readonly log_id: IdLike;
    readonly meta_id: IdLike | null;
    readonly pair_id: IdLike | null;
    constructor(signature: string, slot: number | null | undefined, program_id: string | null | undefined, user_address: string | null | undefined, log_id: IdLike, meta_id?: IdLike | null, pair_id?: IdLike | null);
}
export declare class TransactionsInsertParams {
    readonly log_id: IdLike;
    readonly pair_id: IdLike;
    readonly meta_id: IdLike;
    readonly signature: SigLike;
    readonly program_id: AddressLike;
    readonly slot: IntLike;
    readonly invocation: IntLike;
    readonly mint: MintLike;
    readonly user_address: AddressLike;
    readonly is_buy: boolean;
    readonly ix_name: TradeInstruction;
    readonly sol_amount: BigIntLike;
    readonly token_amount: BigIntLike;
    readonly virtual_sol_reserves: BigIntLike;
    readonly virtual_token_reserves: BigIntLike;
    readonly real_sol_reserves: BigIntLike;
    readonly real_token_reserves: BigIntLike;
    readonly mayhem_mode: boolean;
    readonly price: IntLike;
    readonly track_volume: boolean;
    readonly total_unclaimed_tokens: BigIntLike;
    readonly total_claimed_tokens: BigIntLike;
    readonly current_sol_volume: BigIntLike;
    readonly fee_recipient: AddressLike;
    readonly fee_basis_points: BigIntLike;
    readonly fee: IntLike;
    readonly creator: AddressLike;
    readonly creator_fee_basis_points: BigIntLike;
    readonly creator_fee: BigIntLike;
    readonly timestamp: IntLike;
    readonly last_update_timestamp: IntLike;
    constructor(log_id: IdLike, pair_id: IdLike, meta_id: IdLike, signature: SigLike, program_id: AddressLike, slot: IntLike, invocation: IntLike, mint: MintLike, user_address: AddressLike, is_buy: boolean, ix_name: TradeInstruction, sol_amount: BigIntLike, token_amount: BigIntLike, virtual_sol_reserves: BigIntLike, virtual_token_reserves: BigIntLike, real_sol_reserves: BigIntLike, real_token_reserves: BigIntLike, mayhem_mode: boolean, price: IntLike, track_volume: boolean, total_unclaimed_tokens: BigIntLike, total_claimed_tokens: BigIntLike, current_sol_volume: BigIntLike, fee_recipient: AddressLike, fee_basis_points: BigIntLike, fee: IntLike, creator: AddressLike, creator_fee_basis_points: BigIntLike, creator_fee: BigIntLike, timestamp: IntLike, last_update_timestamp: IntLike);
    toArray(): any[];
}
export declare class BulkTransactionsInsertParams {
    readonly transactions: TransactionsInsertParams[];
    constructor(transactions: TransactionsInsertParams[]);
    get count(): number;
}
export declare class CreatorSignaturesParams {
    readonly signatures: string[];
    constructor(signatures: string[]);
    get count(): number;
}
