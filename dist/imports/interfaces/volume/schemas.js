import { safeSubtract, safeDivide } from './imports.js';
// ============================================================
// VOLUME AGGREGATES
// ============================================================
export class VolumeAggregate {
    pair_id;
    total_sol_volume;
    total_token_volume;
    tx_count;
    buy_count;
    sell_count;
    unique_traders;
    avg_price;
    min_price;
    max_price;
    start_timestamp;
    end_timestamp;
    constructor(pair_id, total_sol_volume, total_token_volume, tx_count, buy_count, sell_count, unique_traders, avg_price, min_price, max_price, start_timestamp, end_timestamp) {
        this.pair_id = pair_id;
        this.total_sol_volume = total_sol_volume;
        this.total_token_volume = total_token_volume;
        this.tx_count = tx_count;
        this.buy_count = buy_count;
        this.sell_count = sell_count;
        this.unique_traders = unique_traders;
        this.avg_price = avg_price;
        this.min_price = min_price;
        this.max_price = max_price;
        this.start_timestamp = start_timestamp;
        this.end_timestamp = end_timestamp;
    }
    get avgSolPerTx() {
        return this.tx_count > 0 ? safeDivide(Number(this.total_sol_volume), this.tx_count) : 0;
    }
    get avgTokenPerTx() {
        return this.tx_count > 0 ? safeDivide(Number(this.total_token_volume), this.tx_count) : 0;
    }
    get buyRatio() {
        return this.tx_count > 0 ? safeDivide(this.buy_count, this.tx_count) : 0;
    }
    get sellRatio() {
        return this.tx_count > 0 ? safeDivide(this.sell_count, this.tx_count) : 0;
    }
    get priceRange() {
        return safeSubtract(this.max_price, this.min_price);
    }
    get priceVolatility() {
        return this.avg_price > 0 ? safeDivide(this.priceRange, this.avg_price) : 0;
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
    id;
    total_sol_volume;
    total_token_volume;
    tx_count;
    processed_at;
    constructor(id, total_sol_volume, total_token_volume, tx_count, processed_at) {
        this.id = id;
        this.total_sol_volume = total_sol_volume;
        this.total_token_volume = total_token_volume;
        this.tx_count = tx_count;
        this.processed_at = processed_at;
    }
    static fromVolumeAggregate(aggregate) {
        return new PairVolumeUpdate(aggregate.pair_id, aggregate.total_sol_volume, aggregate.total_token_volume, aggregate.tx_count, new Date());
    }
}
/**
 * Result of volume refresh operation
 */
export class VolumeRefreshResult {
    updated;
    fields;
    volume;
    constructor(updated, fields, volume) {
        this.updated = updated;
        this.fields = fields;
        this.volume = volume;
    }
}
