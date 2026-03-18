import { PairsRepository } from "./repository/index.js";
import type { DatabaseClient, MintLike, IdLike, AddressLike, SigLike, LimitLike, PairUpsertData, PairInsertData, PairRow, IdentityEnrichParams, PairIdentityParams } from '@imports';
export interface CreatePairParams {
    mint: string;
    log_id: number;
    meta_id: number;
    program_id: string;
    bonding_curve: string;
    associated_bonding_curve: string;
    signature: string;
    creator: string;
    price_token?: string | null;
}
export interface CurosrId {
    created_at: Date;
    id: IdLike;
}
export interface PairsServiceConfig {
    db: DatabaseClient;
}
export interface IdentityParams {
    mint: any;
    program_id: any;
}
export declare class PairsService {
    private readonly repo;
    readonly r: PairsRepository;
    constructor(config: PairsServiceConfig);
    start(): Promise<void>;
    insert(params: PairInsertData): Promise<IdLike | null>;
    upsert(data: PairUpsertData): Promise<PairRow | null>;
    fetch(params: {
        id?: IdLike;
        mint?: MintLike;
        bonding_curve?: AddressLike;
        program_id?: AddressLike;
        associated_bonding_curve?: AddressLike;
        signature?: SigLike;
    }): Promise<PairRow | null>;
    fetchById(id: IdLike): Promise<PairRow | null>;
    fetchByMintAndProgram(mint: MintLike, program_id: AddressLike): Promise<PairRow | null>;
    fetchByBondingCurve(curve: string): Promise<PairRow | null>;
    fetchByAssociatedBondingCurve(curve: string): Promise<PairRow | null>;
    fetchByGenesisSignature(sig: string): Promise<PairRow | null>;
    insertIdentity(params: IdentityParams): Promise<IdLike>;
    assureIdentity(params: PairIdentityParams): Promise<IdLike>;
    assureIdentityEnrich(params: PairIdentityParams): Promise<IdentityEnrichParams>;
    fetchBatchByMints(mints: string[], program_ids: AddressLike[]): Promise<PairRow[]>;
    /**
     * Append one or more transaction IDs to a pair.
     * Guarantees append-only behavior.
     */
    appendTransactions(pairId: number, txnIds: number[] | number): Promise<PairRow>;
    /**
     * Mark pair as fully processed.
     * This is workflow-level state.
     */
    markProcessed(pairId: number): Promise<PairRow>;
    getCursorPage(params: {
        limit: LimitLike;
        cursor?: {
            created_at: Date;
            id: IdLike;
        };
    }): Promise<{
        items: PairRow[];
        next_cursor: {
            created_at: Date;
            id: IdLike;
        } | undefined;
        has_more: boolean;
    }>;
}
export declare function createPairsService(config: PairsServiceConfig): PairsService;
