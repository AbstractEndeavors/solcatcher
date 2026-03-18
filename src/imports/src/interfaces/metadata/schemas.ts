import {
  verifyMint,
  verifyId,
  verifyInRange,
} from './../../verifiers/index.js';
import type {AddressLike,SigLike,StringLike,MintLike} from './imports.js'

// ============================================================
// SCHEMA BASE
// ============================================================

export abstract class MetaDataSchema {
  /** Validate on construction - fail fast */
  constructor() {
    this.validate();
  }

  protected abstract validate(): void;

  /** Convert to plain object for serialization */
  toJSON(): Record<string, unknown> {
    const plain: Record<string, unknown> = {};
    for (const key of Object.keys(this)) {
      plain[key] = (this as any)[key];
    }
    return plain;
  }
}



// ═══════════════════════════════════════════════════════════
// STATUS
// ═══════════════════════════════════════════════════════════

export type MetadataStatus = 'stub' | 'genesis' | 'onchain' | 'complete';

export interface OffchainFetchResult {
  image?:        StringLike;
  description?:  StringLike;
  external_url?: StringLike;
  [key: string]: unknown;
}


/* -------------------------------------------------- */
/* Build EnrichOnchainParams from raw chain payload   */
/*                                                    */
/* Only the 4 indexed projections are extracted.      */
/* Everything else stays in the JSON blob.            */
/* -------------------------------------------------- */

export interface OnchainMetadataPayload {
  publicKey?:            AddressLike;
  updateAuthority?:      AddressLike;
  mintAuthority?:        AddressLike;
  freezeAuthority?:      AddressLike;
  mint?:                 StringLike;
  name?:                 StringLike;
  symbol?:               StringLike;
  uri?:                  StringLike;
  sellerFeeBasisPoints?: number | null;
  isMutable?:            boolean | null;
  primarySaleHappened?:  boolean | null;
  tokenStandard?:        { __option?: string } | AddressLike;
  [key: string]:         unknown;
}
export interface OffchainMetadataPayload {
  image?: StringLike;
  description?: StringLike;
  external_url?: StringLike;
  name?: StringLike;
  symbol?: StringLike;
  attributes?: unknown[] | null;
  properties?: unknown | null;
  [key: string]: unknown;
}

export interface SplMetadataPayload {
  _bn?: unknown;                      // raw BN/Buffer pubkey — needs separate deserialization
  [key: string]: unknown;
}

// ═══════════════════════════════════════════════════════════
// COLUMN GROUPS  (used by buildMetadataUpsert + QueryRegistry)
// ═══════════════════════════════════════════════════════════

export const IDENTITY_COLUMNS = ['mint', 'program_id'] as const;

export const GENESIS_COLUMNS = [
  'name', 'symbol', 'uri', 'discriminator',
  'user_address', 'creator',
  'signature', 'bonding_curve', 'associated_bonding_curve',
  'timestamp',
] as const;

// Projections kept as DB columns for queryability (WHERE / INDEX)
// These are NOT the source of truth — onchain_metadata is.
export const ONCHAIN_PROJECTION_COLUMNS = [
  'metadata_pda',      // = onchain_metadata.publicKey
  'update_authority',  // = onchain_metadata.updateAuthority
  'token_standard',    // = onchain_metadata.tokenStandard
  'is_mutable',        // = onchain_metadata.isMutable
] as const;

export const JSON_COLUMNS = [
  'onchain_metadata',
  'offchain_metadata',
  'spl_metadata',
] as const;

export const LIFECYCLE_COLUMNS = [
  'status',
  'has_onchain_metadata',
  'has_offchain_metadata',
  'claimed_at',
  'created_at',
  'processed_at',
] as const;

export const SCALAR_COLUMNS = [
  ...IDENTITY_COLUMNS,
  ...GENESIS_COLUMNS,
  ...ONCHAIN_PROJECTION_COLUMNS,
  ...LIFECYCLE_COLUMNS
] as const;

export const ALL_COLUMNS = [
  'id',
  ...SCALAR_COLUMNS,
  ...JSON_COLUMNS,
  ...LIFECYCLE_COLUMNS,
] as const;



export class MetaDataEnrichmentRow {
  public constructor(
  // Identity
  public id: number,
  public mint: string,
  public program_id: AddressLike,

  // Genesis (from CreateEvent)
  public name: StringLike,
  public symbol: StringLike,
  public uri: StringLike,
  public discriminator: StringLike,
  public user_address: AddressLike,
  public creator: AddressLike,
  public signature: SigLike,
  public bonding_curve: AddressLike,
  public associated_bonding_curve: AddressLike,
  public timestamp: Date | null,

  // Indexed projections of onchain_metadata (for WHERE clauses only)
  public metadata_pda: AddressLike,
  public update_authority: AddressLike,
  public token_standard: AddressLike,
  public is_mutable: boolean | null,

  // Raw payloads — source of truth for onchain/offchain fields
  public onchain_metadata: OnchainMetadataPayload | null,
  public offchain_metadata: OffchainMetadataPayload | null,
  public spl_metadata: SplMetadataPayload | null,

  // Lifecycle
  public status: MetadataStatus,
  public has_metadata: boolean,
  public has_onchain_metadata: boolean,
  public has_offchain_metadata: boolean,
  public last_fetch: Date,
  public claimed_at: Date | null,
  public created_at: Date,
  public updated_at: Date,
  public processed_at: Date | null,
  ) {}
}
export interface MetaDataRow {
  // ── Identity ──────────────────────────────────────────────
  id: number;
  mint: string;
  program_id: AddressLike;

  // ── Genesis ───────────────────────────────────────────────
  name: StringLike;
  symbol: StringLike;
  uri: StringLike;
  discriminator: StringLike;
  user_address: AddressLike;
  creator: AddressLike;
  signature: SigLike;
  bonding_curve: AddressLike;
  associated_bonding_curve: AddressLike;
  timestamp: Date | null;

  // ── Onchain projections ───────────────────────────────────
  metadata_pda: AddressLike;
  update_authority: AddressLike;
  mint_authority: AddressLike;
  freeze_authority: AddressLike;
  seller_fee_basis_points: number | null;
  primary_sale_happened: boolean | null;
  token_standard: AddressLike;
  is_mutable: boolean | null;

  // ── Offchain projections ──────────────────────────────────
  image: AddressLike;
  description: AddressLike;
  external_url: AddressLike;

  // ── Raw payloads ──────────────────────────────────────────
  onchain_metadata: OnchainMetadataPayload | null;
  offchain_metadata: OffchainMetadataPayload | null;
  spl_metadata: SplMetadataPayload | null;

  // ── Lifecycle ─────────────────────────────────────────────
  status: MetadataStatus;
  has_metadata: boolean;
  has_onchain_metadata: boolean;
  has_offchain_metadata: boolean;
  last_fetch: Date;
  claimed_at: Date | null;
  created_at: Date;
  updated_at: Date;
  processed_at: Date | null;
  

  // ── Derived state ─────────────────────────────────────────
  isStub: boolean;
  hasGenesis: boolean;
  hasOnchain: boolean;
  isComplete: boolean;
  isProcessed: boolean;
  needsUriEnrich: boolean;
  needsOnchainEnrich: boolean;
  displayName: AddressLike;
}

// ═══════════════════════════════════════════════════════════
// INSERT / UPSERT PARAMS
// ═══════════════════════════════════════════════════════════

export interface InsertGenesisParams {
  mint: MintLike;
  name?: StringLike;
  symbol?: StringLike;
  uri?: StringLike;
  discriminator?: StringLike;
  user_address?: AddressLike;
  creator?: AddressLike;
  signature?: SigLike;
  bonding_curve?: AddressLike;
  associated_bonding_curve?: AddressLike;
  program_id?: AddressLike;
  timestamp?: Date | AddressLike;
}

export interface EnrichOnchainParams {
  metadata_pda?: AddressLike;
  update_authority?: AddressLike;
  mint_authority?: AddressLike;       // stored in JSON only
  freeze_authority?: AddressLike;     // stored in JSON only
  seller_fee_basis_points?: number | null;  // stored in JSON only
  is_mutable?: boolean | null;
  primary_sale_happened?: boolean | null;   // stored in JSON only
  token_standard?: AddressLike;
  onchain_metadata?: OnchainMetadataPayload | null;
  spl_metadata?: SplMetadataPayload | null;
}

export interface EnrichOffchainParams {
  offchain_metadata: OffchainMetadataPayload;
}

export interface MetadataUpsertInput extends
  Partial<InsertGenesisParams>,
  Partial<EnrichOnchainParams>,
  Partial<EnrichOffchainParams> {
  id?: number | null;
}


// What fetchMetaData actually returns when it wraps sub-objects
export interface ChainFetchResult {
  metadata?: OnchainMetadataPayload | null;
  spl?:      SplMetadataPayload | null;
}

// ═══════════════════════════════════════════════════════════
// FACTORY
// ═══════════════════════════════════════════════════════════

export function createEventToGenesisParams(event: any): InsertGenesisParams {
  return {
    mint:                     event?.mint,
    name:                     event?.name,
    symbol:                   event?.symbol,
    uri:                      event?.uri,
    discriminator:            event?.discriminator,
    user_address:             event?.user_address,
    creator:                  event?.creator,
    signature:                event?.signature,
    bonding_curve:            event?.bonding_curve,
    associated_bonding_curve: event?.associated_bonding_curve,
    program_id:               event?.program_id,
    timestamp:                event?.timestamp,
  };
}

export type JsonLike = Record<string, any> | null;/*  */


// ============================================================
// QUERY SCHEMAS (Request parameters)
// ============================================================


export class QueryMetaDataByIdParams extends MetaDataSchema {
  constructor(public readonly id: number) {
    super();
  }
  protected validate(): void {
    verifyId(this.id, "QueryByIdParams");
  }
}

export class QueryByMintParams extends MetaDataSchema {
  constructor(public readonly mint: string) {
    super();
  }
  protected validate(): void {
    verifyMint(this.mint, "QueryByMintParams");
  }
}

export class QueryUnprocessedParams extends MetaDataSchema {
  constructor(public readonly limit: number = 100) {
    super();
  }
  protected validate(): void {
    verifyInRange(this.limit, "limit", 1, 1000, "QueryUnprocessedParams");
  }
}

export class SetProcessedParams extends MetaDataSchema {
  constructor(public readonly mint: string) {
    super();
  }
  protected validate(): void {
    verifyMint(this.mint, "SetProcessedParams");
  }
}

export class GetIdByMintParams extends MetaDataSchema {
  constructor(public readonly mint: string) {
    super();
  }
  protected validate(): void {
    verifyMint(this.mint, "GetIdByMintParams");
  }
}
// ============================================================
// COMMAND SCHEMAS (Database inputs)
// ============================================================


export class InsertMetaDataParams extends MetaDataSchema {
  constructor(
    public readonly mint: string,

    /** 🔒 LOSSLESS SOURCE OF TRUTH */
    public readonly raw_payload: unknown,

    // projections
    public readonly metadata_pda?: AddressLike,
    public readonly update_authority?: AddressLike,
    public readonly name?: StringLike,
    public readonly symbol?: StringLike,
    public readonly uri?: StringLike,
    public readonly seller_fee_basis_points?: number | null,
    public readonly is_mutable?: boolean | null,
    public readonly primary_sale_happened?: boolean | null,
    public readonly token_standard?: AddressLike,

    public readonly image?: StringLike,
    public readonly description?: StringLike,
    public readonly external_url?: AddressLike,

    public readonly onchain_metadata?: unknown | null,
    public readonly offchain_metadata?: unknown | null,
    public readonly spl_metadata?: unknown | null,

    public readonly has_metadata?: boolean
  ) {
    super();
  }

  protected validate(): void {
    verifyMint(this.mint, "InsertMetaDataParams");
    if (this.raw_payload === undefined) {
      throw new Error("raw_payload must be provided (nullable allowed)");
    }
  }
}



