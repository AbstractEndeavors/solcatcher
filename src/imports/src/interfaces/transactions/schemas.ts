import { safeDivide,safeSubtract,safeAdd } from './imports.js';
import type {IntLike,IdLike,MintLike,AddressLike,BigIntLike,BoolLike,LimitLike, DateLike,SigLike,TradeInstruction} from './imports.js' 
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
  constructor(
    // Primary
    public readonly id: IdLike,

    // Provenance
    public readonly log_id: IdLike,
    public readonly pair_id: IdLike,
    public readonly meta_id: IdLike,

    // Canonical identity
    public readonly signature: SigLike,

    // Chain context
    public readonly program_id: AddressLike,
    public readonly slot: IntLike,
    public readonly invocation: IntLike,

    // Asset context
    public readonly mint: MintLike,
    public readonly user_address: AddressLike,

    // Trade direction
    public readonly is_buy: BoolLike,
    public readonly ix_name: TradeInstruction,

    // Amounts
    public readonly sol_amount: IntLike,
    public readonly token_amount: IntLike,

    // AMM state
    public readonly virtual_sol_reserves: BigIntLike,
    public readonly virtual_token_reserves: BigIntLike,
    public readonly real_sol_reserves: BigIntLike,
    public readonly real_token_reserves: BigIntLike,
    public readonly mayhem_mode: BoolLike,

    // Pricing
    public readonly price: IntLike,

    // Volume tracking
    public readonly track_volume: BoolLike,
    public readonly total_unclaimed_tokens: BigIntLike,
    public readonly total_claimed_tokens: BigIntLike,
    public readonly current_sol_volume: BigIntLike,

    // Fees
    public readonly fee_recipient: string,
    public readonly fee_basis_points: BigIntLike,
    public readonly fee: BigIntLike,

    // Creator fees
    public readonly creator: string,
    public readonly creator_fee_basis_points: BigIntLike,
    public readonly creator_fee: BigIntLike,

    // Time
    public readonly timestamp: IntLike,
    public readonly last_update_timestamp: IntLike,

    // Lifecycle
    public readonly processed_at: DateLike,
    public readonly created_at: Date,
    public readonly updated_at: Date
  ) {}

  // ──────────────────────────────────────────────────────
  // DERIVED STATE (No setters, pure computation)
  // ──────────────────────────────────────────────────────

  get isBuy(): BoolLike {
    return this.is_buy;
  }

  get isSell(): BoolLike {
    return !this.is_buy;
  }

  get isVolumeTracked(): BoolLike {
    return this.track_volume;
  }

  get isProcessed(): BoolLike {
    return this.processed_at !== null;
  }

  get isMayhemMode(): BoolLike {
    return this.mayhem_mode;
  }

  get effectivePrice(): IntLike {
    return this.price;
  }

  get totalFees(): number {
    return safeAdd(Number(this.fee),Number(this.creator_fee));
  }

  get totalFeeBasisPoints(): number {
    return safeAdd(Number(this.fee_basis_points),Number(this.creator_fee_basis_points));
  }

  get netSolAmount(): IntLike {
    // SOL amount minus fees
    return this.is_buy
      ? safeSubtract(this.sol_amount,Number(this.fee),Number(this.creator_fee))
      : this.sol_amount;
  }

  get slippage(): IntLike {
    // Calculate slippage based on reserves
    // This is a simplified calculation
    const virtualPrice = Number(this.virtual_sol_reserves) / Number(this.virtual_token_reserves);
    const virtSub = safeSubtract(this.price,virtualPrice)
    const virtDiv = safeDivide(virtSub,virtualPrice)
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
  constructor(
    public readonly signature: string,
    public readonly bonding_curve: string | null = null,
    public readonly associated_bonding_curve: string | null = null,
    public readonly mint: string | null = null,
    public readonly program_id: string | null = null,
    public readonly slot: number | null = null,
    public readonly user_address: string | null = null,
    public readonly genesis_signature: string | null = null,
    public readonly owner: string | null = null
  ) {}
}

/**
 * Enrich with monotonic facts
 * Used to add chain/provenance data that never changes
 */
export class EnrichMonotonicParams {
  constructor(
    public readonly id: IdLike,
    public readonly slot: number | null = null,
    public readonly program_id: string | null = null,
    public readonly user_address: string | null = null,
    public readonly log_id: IdLike | null = null,
    public readonly meta_id: IdLike | null = null,
    public readonly pair_id: IdLike | null = null
  ) {}
}

/**
 * Append TCNs to event stream
 * Used to add new token change notifications
 */
export class AppendTcnsParams {
  constructor(
    public readonly id: IdLike,
    public readonly tcns: unknown[]
  ) {
    if (!Array.isArray(tcns)) {
      throw new Error('tcns must be an array');
    }
  }

  get serializedTcns(): string {
    return JSON.stringify(this.tcns);
  }
}

/**
 * Update TCNs (replace entire array)
 * Used when re-processing or fixing data
 */
export class UpdateTcnsParams {
  constructor(
    public readonly id: IdLike,
    public readonly tcns: unknown[]
  ) {
    if (!Array.isArray(tcns)) {
      throw new Error('tcns must be an array');
    }
  }

  get serializedTcns(): string {
    return JSON.stringify(this.tcns);
  }
}

/**
 * Mark transaction as processed
 */
export class MarkProcessedTransactionsParams {
  constructor(
    public readonly id?: IdLike,
    public readonly signature?: SigLike
  ) {
    if (!id && !signature) {
      throw new Error('Either id or signature must be provided');
    }
  }
}

/**
 * Mark multiple transactions as processed
 */
export class MarkProcessedBatchTransactionsParams {
  constructor(
    public readonly ids?: IdLike[],
    public readonly signatures?: SigLike[]
  ) {
    if ((!ids || ids.length === 0) && (!signatures || signatures.length === 0)) {
      throw new Error('Either ids or signatures must be provided');
    }
  }
}

/**
 * Fetch parameters - unified query interface
 */
export class FetchTransactionsParams {
  constructor(
    public readonly id?: IdLike,
    public readonly signature?: SigLike,
    public readonly bonding_curve?: string,
    public readonly limit?: LimitLike,
    public readonly latest?: BoolLike,
    public readonly unprocessed_only?: boolean
  ) {}
}

// ============================================================
// LEGACY COMPATIBILITY (Deprecated, will be removed)
// ============================================================

/**
 * @deprecated Use InsertCurveParams or EnrichMonotonicParams
 * This exists for backwards compatibility only
 */
export class UpsertTransactionsParams {
  constructor(
    public readonly signature: string,
    public readonly slot: number | null = null,
    public readonly program_id: string | null = null,
    public readonly user_address: string | null = null,
    public readonly log_id: IdLike | null = null,
    public readonly meta_id: IdLike | null = null,
    public readonly pair_id: IdLike | null = null,
    public readonly tcns: unknown[] = []
  ) {}

  get serializedTcns(): string {
    return JSON.stringify(this.tcns);
  }
}

/**
 * @deprecated Use InsertCurveParams with EnrichMonotonicParams
 */
export class IngestFromLogParams {
  constructor(
    public readonly signature: string,
    public readonly slot: number | null = null,
    public readonly program_id: string | null = null,
    public readonly user_address: string | null = null,
    public readonly log_id: IdLike,
    public readonly meta_id: IdLike | null = null,
    public readonly pair_id: IdLike | null = null
  ) {}
}

// ============================================================
// INSERT PARAMS (Write: explicit inputs)
// ============================================================

export class TransactionsInsertParams {
  constructor(
    // Provenance
    public readonly log_id: IdLike,
    public readonly pair_id: IdLike,
    public readonly meta_id: IdLike,

    // Identity
    public readonly signature: SigLike,

    // Chain context
    public readonly program_id: AddressLike,
    public readonly slot: IntLike,
    public readonly invocation: IntLike,

    // Asset context
    public readonly mint: MintLike,
    public readonly user_address: AddressLike,

    // Trade
    public readonly is_buy: boolean,
    public readonly ix_name: TradeInstruction,

    // Amounts
    public readonly sol_amount: BigIntLike,
    public readonly token_amount: BigIntLike,

    // AMM state
    public readonly virtual_sol_reserves: BigIntLike,
    public readonly virtual_token_reserves: BigIntLike,
    public readonly real_sol_reserves: BigIntLike,
    public readonly real_token_reserves: BigIntLike,
    public readonly mayhem_mode: boolean,

    // Pricing
    public readonly price: IntLike,

    // Volume tracking
    public readonly track_volume: boolean,
    public readonly total_unclaimed_tokens: BigIntLike,
    public readonly total_claimed_tokens: BigIntLike,
    public readonly current_sol_volume: BigIntLike,

    // Fees
    public readonly fee_recipient: AddressLike,
    public readonly fee_basis_points: BigIntLike,
    public readonly fee: IntLike,

    // Creator fees
    public readonly creator: AddressLike,
    public readonly creator_fee_basis_points: BigIntLike,
    public readonly creator_fee: BigIntLike,

    // Time
    public readonly timestamp: IntLike,
    public readonly last_update_timestamp: IntLike
  ) {}

  toArray(): any[] {
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
  constructor(
    public readonly transactions: TransactionsInsertParams[]
  ) {
    if (transactions.length === 0) {
      throw new Error('BulkInsertParams: transactions array cannot be empty');
    }
  }

  get count(): number {
    return this.transactions.length;
  }
}

export class CreatorSignaturesParams {
  constructor(
    public readonly signatures: string[]
  ) {
    if (signatures.length === 0) {
      throw new Error('CreatorSignaturesParams: signatures array cannot be empty');
    }
  }

  get count(): number {
    return this.signatures.length;
  }
}


