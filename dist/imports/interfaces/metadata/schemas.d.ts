export declare abstract class MetaDataSchema {
    /** Validate on construction - fail fast */
    constructor();
    protected abstract validate(): void;
    /** Convert to plain object for serialization */
    toJSON(): Record<string, unknown>;
}
export type MetadataStatus = 'stub' | 'genesis' | 'onchain' | 'complete';
export interface OffchainFetchResult {
    image?: string | null;
    description?: string | null;
    external_url?: string | null;
    [key: string]: unknown;
}
export interface OnchainMetadataPayload {
    publicKey?: string | null;
    updateAuthority?: string | null;
    mintAuthority?: string | null;
    freezeAuthority?: string | null;
    mint?: string | null;
    name?: string | null;
    symbol?: string | null;
    uri?: string | null;
    sellerFeeBasisPoints?: number | null;
    isMutable?: boolean | null;
    primarySaleHappened?: boolean | null;
    tokenStandard?: {
        __option?: string;
    } | string | null;
    [key: string]: unknown;
}
export interface OffchainMetadataPayload {
    image?: string | null;
    description?: string | null;
    external_url?: string | null;
    name?: string | null;
    symbol?: string | null;
    attributes?: unknown[] | null;
    properties?: unknown | null;
    [key: string]: unknown;
}
export interface SplMetadataPayload {
    _bn?: unknown;
    [key: string]: unknown;
}
export declare const IDENTITY_COLUMNS: readonly ["mint", "program_id"];
export declare const GENESIS_COLUMNS: readonly ["name", "symbol", "uri", "discriminator", "user_address", "creator", "signature", "bonding_curve", "associated_bonding_curve", "timestamp"];
export declare const ONCHAIN_PROJECTION_COLUMNS: readonly ["metadata_pda", "update_authority", "token_standard", "is_mutable"];
export declare const JSON_COLUMNS: readonly ["onchain_metadata", "offchain_metadata", "spl_metadata"];
export declare const LIFECYCLE_COLUMNS: readonly ["status", "has_metadata", "has_onchain_metadata", "has_offchain_metadata", "created_at", "updated_at", "processed_at"];
export declare const SCALAR_COLUMNS: readonly ["mint", "program_id", "name", "symbol", "uri", "discriminator", "user_address", "creator", "signature", "bonding_curve", "associated_bonding_curve", "timestamp", "metadata_pda", "update_authority", "token_standard", "is_mutable"];
export declare const ALL_COLUMNS: readonly ["id", "mint", "program_id", "name", "symbol", "uri", "discriminator", "user_address", "creator", "signature", "bonding_curve", "associated_bonding_curve", "timestamp", "metadata_pda", "update_authority", "token_standard", "is_mutable", "onchain_metadata", "offchain_metadata", "spl_metadata", "status", "has_metadata", "has_onchain_metadata", "has_offchain_metadata", "created_at", "updated_at", "processed_at"];
export declare class MetaDataEnrichmentRow {
    id: number;
    mint: string;
    program_id: string | null;
    name: string | null;
    symbol: string | null;
    uri: string | null;
    discriminator: string | null;
    user_address: string | null;
    creator: string | null;
    signature: string | null;
    bonding_curve: string | null;
    associated_bonding_curve: string | null;
    timestamp: Date | null;
    metadata_pda: string | null;
    update_authority: string | null;
    token_standard: string | null;
    is_mutable: boolean | null;
    onchain_metadata: OnchainMetadataPayload | null;
    offchain_metadata: OffchainMetadataPayload | null;
    spl_metadata: SplMetadataPayload | null;
    status: MetadataStatus;
    has_metadata: boolean;
    has_onchain_metadata: boolean;
    has_offchain_metadata: boolean;
    created_at: Date;
    updated_at: Date;
    processed_at: Date | null;
    constructor(id: number, mint: string, program_id: string | null, name: string | null, symbol: string | null, uri: string | null, discriminator: string | null, user_address: string | null, creator: string | null, signature: string | null, bonding_curve: string | null, associated_bonding_curve: string | null, timestamp: Date | null, metadata_pda: string | null, update_authority: string | null, token_standard: string | null, is_mutable: boolean | null, onchain_metadata: OnchainMetadataPayload | null, offchain_metadata: OffchainMetadataPayload | null, spl_metadata: SplMetadataPayload | null, status: MetadataStatus, has_metadata: boolean, has_onchain_metadata: boolean, has_offchain_metadata: boolean, created_at: Date, updated_at: Date, processed_at: Date | null);
}
export interface MetaDataRow {
    id: number;
    mint: string;
    program_id: string | null;
    name: string | null;
    symbol: string | null;
    uri: string | null;
    discriminator: string | null;
    user_address: string | null;
    creator: string | null;
    signature: string | null;
    bonding_curve: string | null;
    associated_bonding_curve: string | null;
    timestamp: Date | null;
    metadata_pda: string | null;
    update_authority: string | null;
    mint_authority: string | null;
    freeze_authority: string | null;
    seller_fee_basis_points: number | null;
    primary_sale_happened: boolean | null;
    token_standard: string | null;
    is_mutable: boolean | null;
    image: string | null;
    description: string | null;
    external_url: string | null;
    onchain_metadata: OnchainMetadataPayload | null;
    offchain_metadata: OffchainMetadataPayload | null;
    spl_metadata: SplMetadataPayload | null;
    status: MetadataStatus;
    has_metadata: boolean;
    has_onchain_metadata: boolean;
    has_offchain_metadata: boolean;
    created_at: Date;
    updated_at: Date;
    processed_at: Date | null;
    isStub: boolean;
    hasGenesis: boolean;
    hasOnchain: boolean;
    isComplete: boolean;
    isProcessed: boolean;
    needsUriEnrich: boolean;
    needsOnchainEnrich: boolean;
    displayName: string | null;
}
export interface InsertGenesisParams {
    mint: string;
    name?: string | null;
    symbol?: string | null;
    uri?: string | null;
    discriminator?: string | null;
    user_address?: string | null;
    creator?: string | null;
    signature?: string | null;
    bonding_curve?: string | null;
    associated_bonding_curve?: string | null;
    program_id?: string | null;
    timestamp?: Date | string | null;
}
export interface EnrichOnchainParams {
    metadata_pda?: string | null;
    update_authority?: string | null;
    mint_authority?: string | null;
    freeze_authority?: string | null;
    seller_fee_basis_points?: number | null;
    is_mutable?: boolean | null;
    primary_sale_happened?: boolean | null;
    token_standard?: string | null;
    onchain_metadata?: OnchainMetadataPayload | null;
    spl_metadata?: SplMetadataPayload | null;
}
export interface EnrichOffchainParams {
    offchain_metadata: OffchainMetadataPayload;
}
export interface MetadataUpsertInput extends Partial<InsertGenesisParams>, Partial<EnrichOnchainParams>, Partial<EnrichOffchainParams> {
    id?: number | null;
}
export interface ChainFetchResult {
    metadata?: OnchainMetadataPayload | null;
    spl?: SplMetadataPayload | null;
}
export declare function createEventToGenesisParams(event: any): InsertGenesisParams;
export type JsonLike = Record<string, any> | null;
export declare class QueryMetaDataByIdParams extends MetaDataSchema {
    readonly id: number;
    constructor(id: number);
    protected validate(): void;
}
export declare class QueryByMintParams extends MetaDataSchema {
    readonly mint: string;
    constructor(mint: string);
    protected validate(): void;
}
export declare class QueryUnprocessedParams extends MetaDataSchema {
    readonly limit: number;
    constructor(limit?: number);
    protected validate(): void;
}
export declare class SetProcessedParams extends MetaDataSchema {
    readonly mint: string;
    constructor(mint: string);
    protected validate(): void;
}
export declare class GetIdByMintParams extends MetaDataSchema {
    readonly mint: string;
    constructor(mint: string);
    protected validate(): void;
}
export declare class InsertMetaDataParams extends MetaDataSchema {
    readonly mint: string;
    /** 🔒 LOSSLESS SOURCE OF TRUTH */
    readonly raw_payload: unknown;
    readonly metadata_pda?: string | null | undefined;
    readonly update_authority?: string | null | undefined;
    readonly name?: string | null | undefined;
    readonly symbol?: string | null | undefined;
    readonly uri?: string | null | undefined;
    readonly seller_fee_basis_points?: number | null | undefined;
    readonly is_mutable?: boolean | null | undefined;
    readonly primary_sale_happened?: boolean | null | undefined;
    readonly token_standard?: string | null | undefined;
    readonly image?: string | null | undefined;
    readonly description?: string | null | undefined;
    readonly external_url?: string | null | undefined;
    readonly onchain_metadata?: unknown | null | undefined;
    readonly offchain_metadata?: unknown | null | undefined;
    readonly spl_metadata?: unknown | null | undefined;
    readonly has_metadata?: boolean | undefined;
    constructor(mint: string, 
    /** 🔒 LOSSLESS SOURCE OF TRUTH */
    raw_payload: unknown, metadata_pda?: string | null | undefined, update_authority?: string | null | undefined, name?: string | null | undefined, symbol?: string | null | undefined, uri?: string | null | undefined, seller_fee_basis_points?: number | null | undefined, is_mutable?: boolean | null | undefined, primary_sale_happened?: boolean | null | undefined, token_standard?: string | null | undefined, image?: string | null | undefined, description?: string | null | undefined, external_url?: string | null | undefined, onchain_metadata?: unknown | null | undefined, offchain_metadata?: unknown | null | undefined, spl_metadata?: unknown | null | undefined, has_metadata?: boolean | undefined);
    protected validate(): void;
}
