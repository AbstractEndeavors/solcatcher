import { verifyMint, verifyId, verifyInRange, } from './../../verifiers/index.js';
// ============================================================
// SCHEMA BASE
// ============================================================
export class MetaDataSchema {
    /** Validate on construction - fail fast */
    constructor() {
        this.validate();
    }
    /** Convert to plain object for serialization */
    toJSON() {
        const plain = {};
        for (const key of Object.keys(this)) {
            plain[key] = this[key];
        }
        return plain;
    }
}
// ═══════════════════════════════════════════════════════════
// COLUMN GROUPS  (used by buildMetadataUpsert + QueryRegistry)
// ═══════════════════════════════════════════════════════════
export const IDENTITY_COLUMNS = ['mint', 'program_id'];
export const GENESIS_COLUMNS = [
    'name', 'symbol', 'uri', 'discriminator',
    'user_address', 'creator',
    'signature', 'bonding_curve', 'associated_bonding_curve',
    'timestamp',
];
// Projections kept as DB columns for queryability (WHERE / INDEX)
// These are NOT the source of truth — onchain_metadata is.
export const ONCHAIN_PROJECTION_COLUMNS = [
    'metadata_pda', // = onchain_metadata.publicKey
    'update_authority', // = onchain_metadata.updateAuthority
    'token_standard', // = onchain_metadata.tokenStandard
    'is_mutable', // = onchain_metadata.isMutable
];
export const JSON_COLUMNS = [
    'onchain_metadata',
    'offchain_metadata',
    'spl_metadata',
];
export const LIFECYCLE_COLUMNS = [
    'status',
    'has_metadata',
    'has_onchain_metadata',
    'has_offchain_metadata',
    'created_at',
    'updated_at',
    'processed_at',
];
export const SCALAR_COLUMNS = [
    ...IDENTITY_COLUMNS,
    ...GENESIS_COLUMNS,
    ...ONCHAIN_PROJECTION_COLUMNS,
];
export const ALL_COLUMNS = [
    'id',
    ...SCALAR_COLUMNS,
    ...JSON_COLUMNS,
    ...LIFECYCLE_COLUMNS,
];
export class MetaDataEnrichmentRow {
    id;
    mint;
    program_id;
    name;
    symbol;
    uri;
    discriminator;
    user_address;
    creator;
    signature;
    bonding_curve;
    associated_bonding_curve;
    timestamp;
    metadata_pda;
    update_authority;
    token_standard;
    is_mutable;
    onchain_metadata;
    offchain_metadata;
    spl_metadata;
    status;
    has_metadata;
    has_onchain_metadata;
    has_offchain_metadata;
    created_at;
    updated_at;
    processed_at;
    constructor(
    // Identity
    id, mint, program_id, 
    // Genesis (from CreateEvent)
    name, symbol, uri, discriminator, user_address, creator, signature, bonding_curve, associated_bonding_curve, timestamp, 
    // Indexed projections of onchain_metadata (for WHERE clauses only)
    metadata_pda, update_authority, token_standard, is_mutable, 
    // Raw payloads — source of truth for onchain/offchain fields
    onchain_metadata, offchain_metadata, spl_metadata, 
    // Lifecycle
    status, has_metadata, has_onchain_metadata, has_offchain_metadata, created_at, updated_at, processed_at) {
        this.id = id;
        this.mint = mint;
        this.program_id = program_id;
        this.name = name;
        this.symbol = symbol;
        this.uri = uri;
        this.discriminator = discriminator;
        this.user_address = user_address;
        this.creator = creator;
        this.signature = signature;
        this.bonding_curve = bonding_curve;
        this.associated_bonding_curve = associated_bonding_curve;
        this.timestamp = timestamp;
        this.metadata_pda = metadata_pda;
        this.update_authority = update_authority;
        this.token_standard = token_standard;
        this.is_mutable = is_mutable;
        this.onchain_metadata = onchain_metadata;
        this.offchain_metadata = offchain_metadata;
        this.spl_metadata = spl_metadata;
        this.status = status;
        this.has_metadata = has_metadata;
        this.has_onchain_metadata = has_onchain_metadata;
        this.has_offchain_metadata = has_offchain_metadata;
        this.created_at = created_at;
        this.updated_at = updated_at;
        this.processed_at = processed_at;
    }
}
// ═══════════════════════════════════════════════════════════
// FACTORY
// ═══════════════════════════════════════════════════════════
export function createEventToGenesisParams(event) {
    return {
        mint: event?.mint,
        name: event?.name,
        symbol: event?.symbol,
        uri: event?.uri,
        discriminator: event?.discriminator,
        user_address: event?.user_address,
        creator: event?.creator,
        signature: event?.signature,
        bonding_curve: event?.bonding_curve,
        associated_bonding_curve: event?.associated_bonding_curve,
        program_id: event?.program_id,
        timestamp: event?.timestamp,
    };
}
// ============================================================
// QUERY SCHEMAS (Request parameters)
// ============================================================
export class QueryMetaDataByIdParams extends MetaDataSchema {
    id;
    constructor(id) {
        super();
        this.id = id;
    }
    validate() {
        verifyId(this.id, "QueryByIdParams");
    }
}
export class QueryByMintParams extends MetaDataSchema {
    mint;
    constructor(mint) {
        super();
        this.mint = mint;
    }
    validate() {
        verifyMint(this.mint, "QueryByMintParams");
    }
}
export class QueryUnprocessedParams extends MetaDataSchema {
    limit;
    constructor(limit = 100) {
        super();
        this.limit = limit;
    }
    validate() {
        verifyInRange(this.limit, "limit", 1, 1000, "QueryUnprocessedParams");
    }
}
export class SetProcessedParams extends MetaDataSchema {
    mint;
    constructor(mint) {
        super();
        this.mint = mint;
    }
    validate() {
        verifyMint(this.mint, "SetProcessedParams");
    }
}
export class GetIdByMintParams extends MetaDataSchema {
    mint;
    constructor(mint) {
        super();
        this.mint = mint;
    }
    validate() {
        verifyMint(this.mint, "GetIdByMintParams");
    }
}
// ============================================================
// COMMAND SCHEMAS (Database inputs)
// ============================================================
export class InsertMetaDataParams extends MetaDataSchema {
    mint;
    raw_payload;
    metadata_pda;
    update_authority;
    name;
    symbol;
    uri;
    seller_fee_basis_points;
    is_mutable;
    primary_sale_happened;
    token_standard;
    image;
    description;
    external_url;
    onchain_metadata;
    offchain_metadata;
    spl_metadata;
    has_metadata;
    constructor(mint, 
    /** 🔒 LOSSLESS SOURCE OF TRUTH */
    raw_payload, 
    // projections
    metadata_pda, update_authority, name, symbol, uri, seller_fee_basis_points, is_mutable, primary_sale_happened, token_standard, image, description, external_url, onchain_metadata, offchain_metadata, spl_metadata, has_metadata) {
        super();
        this.mint = mint;
        this.raw_payload = raw_payload;
        this.metadata_pda = metadata_pda;
        this.update_authority = update_authority;
        this.name = name;
        this.symbol = symbol;
        this.uri = uri;
        this.seller_fee_basis_points = seller_fee_basis_points;
        this.is_mutable = is_mutable;
        this.primary_sale_happened = primary_sale_happened;
        this.token_standard = token_standard;
        this.image = image;
        this.description = description;
        this.external_url = external_url;
        this.onchain_metadata = onchain_metadata;
        this.offchain_metadata = offchain_metadata;
        this.spl_metadata = spl_metadata;
        this.has_metadata = has_metadata;
    }
    validate() {
        verifyMint(this.mint, "InsertMetaDataParams");
        if (this.raw_payload === undefined) {
            throw new Error("raw_payload must be provided (nullable allowed)");
        }
    }
}
