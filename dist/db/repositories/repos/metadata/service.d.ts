import { MetaDataRepository } from './repository/MetaDataRepository.js';
import { type MetaDataRow } from '@imports';
import type { DatabaseClient, MetadataUpsertInput, MintLike, IdLike, LimitLike, EnrichOffchainParams, EnrichOnchainParams, InsertGenesisParams, AddressLike, MetaDataIdentityParams, PairIdentityParams, IdentityParams, IdentityEnrichParams } from '@imports';
export interface MetaDataServiceConfig {
    db: DatabaseClient;
}
export declare class MetaDataService {
    private readonly repo;
    readonly r: MetaDataRepository;
    constructor(config: MetaDataServiceConfig);
    start(): Promise<void>;
    /**
     * Get or create stub metadata.
     * Returns { id, was_stub } to signal if enrichment is needed.
     */
    resolveOrStub(mint: MintLike, program_id: AddressLike): Promise<{
        id: IdLike;
        was_stub: boolean;
    }>;
    /**
     * Upsert genesis metadata from a CreateEvent.
     * Upgrades stub → genesis if exists.
     */
    insertFromCreateEvent(event: any): Promise<IdLike>;
    upsertGenesis(params: MetadataUpsertInput): Promise<MetaDataRow>;
    /**
     * Insert genesis metadata directly.
     */
    insertGenesis(params: InsertGenesisParams): Promise<IdLike>;
    /**
     * Enrich with onchain metadata from Metaplex.
     */
    enrichOnchain(id: IdLike, params: EnrichOnchainParams): Promise<IdLike>;
    /**
     * Enrich with offchain metadata from URI fetch.
     */
    enrichOffchain(id: IdLike, params: EnrichOffchainParams): Promise<IdLike>;
    fetch(params: MetaDataIdentityParams): Promise<MetaDataRow | null>;
    fetchById(id: IdLike): Promise<MetaDataRow | null>;
    fetchByMint(mint: MintLike): Promise<MetaDataRow | null>;
    getIdByMint(mint: MintLike): Promise<IdLike | null>;
    insertIdentity(params: IdentityParams): Promise<IdLike>;
    assureIdentity(params: PairIdentityParams): Promise<IdLike>;
    assureIdentityEnrich(params: PairIdentityParams): Promise<IdentityEnrichParams>;
    fetchPendingUri(limit?: LimitLike): Promise<MetaDataRow[]>;
    fetchPendingOnchain(limit?: LimitLike): Promise<MetaDataRow[]>;
    fetchBatchByMints(mints: string[], program_ids: AddressLike[]): Promise<MetaDataRow[]>;
    markProcessed(mint: MintLike): Promise<IdLike>;
}
export declare function createMetaDataService(config: MetaDataServiceConfig): MetaDataService;
