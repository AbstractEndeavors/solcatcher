import { TransactionsRepository } from "./repository/index.js";
import type { DatabaseClient, IdLike, SigLike, AddressLike, MintLike, TransactionsInsertParams, TransactionsRow, VolumeAggregate, PairRollup, TimeRange, PaginationCursor } from '@imports';
export interface TransactionsServiceConfig {
    db: DatabaseClient;
}
export declare class TransactionsService {
    private readonly repo;
    private readonly pairsRepo;
    readonly r: TransactionsRepository;
    constructor(config: TransactionsServiceConfig);
    initSchema(): Promise<void>;
    applyPotentialIndexes(): Promise<void>;
    /**
     * Idempotent insert with pair linkage.
     * Returns existing id on conflict.
     */
    insertTransactions(params: TransactionsInsertParams): Promise<IdLike>;
    /**
     * Batch insert with conflict handling.
     * Returns map of signature → id.
     */
    insertTransactionsBatch(paramsList: TransactionsInsertParams[]): Promise<Map<SigLike, IdLike>>;
    fetchById(id: IdLike): Promise<TransactionsRow | null>;
    fetchBySignature(signature: SigLike): Promise<TransactionsRow | null>;
    fetchByPair(pairId: IdLike): Promise<TransactionsRow[]>;
    fetchByMint(mint: MintLike): Promise<TransactionsRow[]>;
    fetchByUser(userAddress: AddressLike, limit?: number): Promise<TransactionsRow[]>;
    fetchByUserAndPair(userAddress: AddressLike, pairId: IdLike): Promise<TransactionsRow[]>;
    fetchUserHistory(userAddress: AddressLike, options?: {
        limit?: number;
        pairId?: IdLike;
    }): Promise<TransactionsRow[]>;
    fetchByCreator(creator: AddressLike, limit?: number): Promise<TransactionsRow[]>;
    fetchLatest(limit?: number): Promise<TransactionsRow[]>;
    fetchOldest(limit?: number): Promise<TransactionsRow[]>;
    fetchPageByPair(pairId: IdLike, cursor: PaginationCursor): Promise<TransactionsRow[]>;
    fetchPageByUser(userAddress: AddressLike, cursor: PaginationCursor): Promise<TransactionsRow[]>;
    fetchByPairInRange(pairId: IdLike, range: TimeRange): Promise<TransactionsRow[]>;
    fetchByUserInRange(userAddress: AddressLike, range: TimeRange): Promise<TransactionsRow[]>;
    exists(signature: SigLike): Promise<boolean>;
    existsById(id: IdLike): Promise<boolean>;
    countByPair(pairId: IdLike): Promise<number>;
    countByUser(userAddress: AddressLike): Promise<number>;
    getVolumeByPair(pairId: IdLike): Promise<VolumeAggregate | null>;
    getVolumeByUser(userAddress: AddressLike): Promise<VolumeAggregate | null>;
    refreshPairRollup(pairId: IdLike): Promise<PairRollup | null>;
    getPairRollup(pairId: IdLike): Promise<PairRollup | null>;
    sumVolumeByUser(userAddress: AddressLike): Promise<VolumeAggregate | null>;
    sumVolumeByPair(pairId: IdLike): Promise<VolumeAggregate | null>;
    fetchByIds(ids: IdLike[]): Promise<TransactionsRow[]>;
    fetchCreatorAccountIdsBySignatures(signatures: SigLike[]): Promise<IdLike[]>;
}
export declare function createTransactionsService(config: TransactionsServiceConfig): TransactionsService;
export type { TransactionsInsertParams, TransactionsRow, VolumeAggregate, PairRollup, TimeRange, PaginationCursor, };
