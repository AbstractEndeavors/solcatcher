import type { IntLike, BigIntLike, IdLike } from './imports.js';
export declare class VolumeAggregate {
    readonly pair_id: IdLike;
    readonly total_sol_volume: BigIntLike;
    readonly total_token_volume: BigIntLike;
    readonly tx_count: IntLike;
    readonly buy_count: IntLike;
    readonly sell_count: IntLike;
    readonly unique_traders: IntLike;
    readonly avg_price: IntLike;
    readonly min_price: IntLike;
    readonly max_price: IntLike;
    readonly start_timestamp: BigIntLike;
    readonly end_timestamp: BigIntLike;
    constructor(pair_id: IdLike, total_sol_volume: BigIntLike, total_token_volume: BigIntLike, tx_count: IntLike, buy_count: IntLike, sell_count: IntLike, unique_traders: IntLike, avg_price: IntLike, min_price: IntLike, max_price: IntLike, start_timestamp: BigIntLike, end_timestamp: BigIntLike);
    get avgSolPerTx(): BigIntLike;
    get avgTokenPerTx(): BigIntLike;
    get buyRatio(): IntLike;
    get sellRatio(): IntLike;
    get priceRange(): IntLike;
    get priceVolatility(): IntLike;
}
/**
 * Volume aggregate from transactions repository
 * This is what sumVolumeByPair returns
 */
export declare class PairVolumeUpdate {
    readonly id: IdLike;
    readonly total_sol_volume: BigIntLike;
    readonly total_token_volume: BigIntLike;
    readonly tx_count: IntLike;
    readonly processed_at: Date;
    constructor(id: IdLike, total_sol_volume: BigIntLike, total_token_volume: BigIntLike, tx_count: IntLike, processed_at: Date);
    static fromVolumeAggregate(aggregate: VolumeAggregate): PairVolumeUpdate;
}
/**
 * Result of volume refresh operation
 */
export declare class VolumeRefreshResult {
    readonly updated: boolean;
    readonly fields: string[];
    readonly volume: VolumeAggregate | null;
    constructor(updated: boolean, fields: string[], volume: VolumeAggregate | null);
}
