import type {IntLike,BigIntLike,IdLike} from './imports.js';
import {safeSubtract,safeDivide} from './imports.js';
// ============================================================
// VOLUME AGGREGATES
// ============================================================

export class VolumeAggregate {
  constructor(
    public readonly pair_id: IdLike,
    public readonly total_sol_volume: BigIntLike,
    public readonly total_token_volume: BigIntLike,
    public readonly tx_count: IntLike,
    public readonly buy_count: IntLike,
    public readonly sell_count: IntLike,
    public readonly unique_traders: IntLike,
    public readonly avg_price: IntLike,
    public readonly min_price: IntLike,
    public readonly max_price: IntLike,
    public readonly start_timestamp: BigIntLike,
    public readonly end_timestamp: BigIntLike
  ) {}

  get avgSolPerTx(): BigIntLike {
    return this.tx_count as number > 0 ? safeDivide(Number(this.total_sol_volume),this.tx_count) : 0;
  }

  get avgTokenPerTx(): BigIntLike {
    return this.tx_count as number > 0 ? safeDivide(Number(this.total_token_volume),this.tx_count) : 0;
  }

  get buyRatio(): IntLike {
    return this.tx_count as number > 0 ? safeDivide(this.buy_count,this.tx_count) : 0;
  }

  get sellRatio(): IntLike {
    return this.tx_count as number > 0 ? safeDivide(this.sell_count,this.tx_count) : 0;
  }

  get priceRange(): IntLike {
    return safeSubtract(this.max_price,this.min_price);
  }

  get priceVolatility(): IntLike {
    return this.avg_price as number > 0 ? safeDivide(this.priceRange,this.avg_price) : 0;
  }
}

// ============================================================
// SCHEMAS - Explicit data structures
// ============================================================

/**
 * Volume aggregate from transactions repository
 * This is what sumVolumeByPair returns
 */
/*export class VolumeAggregate {
  constructor(
    public readonly pair_id: IdLike,
    public readonly total_sol_volume: bigint,
    public readonly total_token_volume: bigint,
    public readonly tx_count: number
  ) {}
}

/**
 * Volume update for pairs repository
 * Maps transaction volume to pair fields
 */
export class PairVolumeUpdate {
  constructor(
    public readonly id: IdLike,
    public readonly total_sol_volume: BigIntLike,
    public readonly total_token_volume: BigIntLike,
    public readonly tx_count: IntLike,
    public readonly processed_at: Date
  ) {}

  static fromVolumeAggregate(
    aggregate: VolumeAggregate
  ): PairVolumeUpdate {
    return new PairVolumeUpdate(
      aggregate.pair_id,
      aggregate.total_sol_volume,
      aggregate.total_token_volume,
      aggregate.tx_count,
      new Date()
    );
  }
}

/**
 * Result of volume refresh operation
 */
export class VolumeRefreshResult {
  constructor(
    public readonly updated: boolean,
    public readonly fields: string[],
    public readonly volume: VolumeAggregate | null
  ) {}
}