// src/db/repositories/repos/metadata/repository/MetaDataRepository.ts

import {
  type MetaDataRow,
  type MetadataStatus,
  firstRowIdOrNull,
  bindRepo
} from '@imports';
import type { DatabaseClient } from '@imports';
import { QueryRegistry } from './../query-registry.js';
import type {IdLike,MintLike} from '@imports';
import * as src from './src/index.js';
// Define which queries are valid for fetching
type FetchQueryKey = 
  | 'FETCH_BY_ID'
  | 'FETCH_BY_MINT'
  | 'FETCH_BY_BONDING_CURVE'
  | 'FETCH_BY_PROGRAM'
  | 'FETCH_BY_MINT_AND_PROGRAM'
  | 'FETCH_BY_ASSOCIATED_BONDING_CURVE'
  | 'FETCH_BY_SIGNATURE'  // Only uppercase
  | 'FETCH_STUBS'
  | 'FETCH_CURSOR_INITIAL'
  | 'FETCH_CURSOR';

export type MetaDataRepositoryBindings = typeof src;
export interface MetaDataRepository extends MetaDataRepositoryBindings {}  // ← matches class name
export class MetaDataRepository {
  constructor(readonly db: DatabaseClient) {
    bindRepo(this, { src });
  }
private async executeIndexCreation(): Promise<void> {
  const indexes: string[] = [...QueryRegistry.CREATE_INDEXES];
  await Promise.all(indexes.map(sql => this.db.query(sql)));
}
async createTable(): Promise<void> {
  await this.db.query(QueryRegistry.CREATE_TABLE);
  // Add type assertion for the array iteration
  for (const q of QueryRegistry.CREATE_INDEXES as readonly string[]) {
    await this.db.query(q);
  }
}
rowToModel(row: any): MetaDataRow {
  // Resolve token_standard — DB column or JSON payload, normalize object form
  const rawStandard = row.token_standard ?? row.onchain_metadata?.tokenStandard ?? null;
  const token_standard =
    rawStandard == null           ? null
    : typeof rawStandard === 'object' ? (rawStandard.__option ?? null)
    : rawStandard;

  const status: MetadataStatus = row.status ?? 'stub';

  return {
    // ── Identity ────────────────────────────────────────────
    id:         row.id,
    mint:       row.mint,
    program_id: row.program_id ?? null,

    // ── Genesis — scalar wins, fall back to onchain payload ─
    name:        row.name        ?? row.onchain_metadata?.name   ?? null,
    symbol:      row.symbol      ?? row.onchain_metadata?.symbol ?? null,
    uri:         row.uri         ?? row.onchain_metadata?.uri    ?? null,
    discriminator:            row.discriminator            ?? null,
    user_address:             row.user_address             ?? null,
    creator:                  row.creator                  ?? null,
    signature:                row.signature                ?? null,
    bonding_curve:            row.bonding_curve            ?? null,
    associated_bonding_curve: row.associated_bonding_curve ?? null,
    timestamp:                row.timestamp                ?? null,

    // ── Onchain — DB projection ?? JSON payload ─────────────
    metadata_pda:            row.metadata_pda     ?? row.onchain_metadata?.publicKey        ?? null,
    update_authority:        row.update_authority ?? row.onchain_metadata?.updateAuthority  ?? null,
    mint_authority:                                  row.onchain_metadata?.mintAuthority    ?? null,
    freeze_authority:                                row.onchain_metadata?.freezeAuthority  ?? null,
    seller_fee_basis_points:                         row.onchain_metadata?.sellerFeeBasisPoints ?? null,
    primary_sale_happened:                           row.onchain_metadata?.primarySaleHappened  ?? null,
    token_standard,
    is_mutable: row.is_mutable ?? row.onchain_metadata?.isMutable ?? null,

    // ── Offchain — payload is source of truth ───────────────
    image:        row.offchain_metadata?.image        ?? row.image        ?? null,
    description:  row.offchain_metadata?.description  ?? row.description  ?? null,
    external_url: row.offchain_metadata?.external_url ?? row.external_url ?? null,

    // ── Raw payloads ─────────────────────────────────────────
    onchain_metadata:  row.onchain_metadata  ?? null,
    offchain_metadata: row.offchain_metadata ?? null,
    spl_metadata:      row.spl_metadata      ?? null,
    // ── Lifecycle ────────────────────────────────────────────
    status,
    has_metadata:          row.has_metadata          ?? false,
    has_onchain_metadata:  row.has_onchain_metadata  ?? false,
    has_offchain_metadata: row.has_offchain_metadata ?? false,
    last_fetch: row.last_fetch,
    created_at:  row.created_at,
    updated_at:  row.updated_at,
    processed_at: row.processed_at ?? null,

    // ── Derived state (computed once at boundary, not on every access) ──
    isStub:            status === 'stub',
    hasGenesis:        status !== 'stub',
    hasOnchain:        status === 'onchain' || status === 'complete',
    isComplete:        status === 'complete',
    isProcessed:       row.processed_at !== null,
    needsUriEnrich:    status === 'genesis' && (row.uri ?? row.onchain_metadata?.uri) !== null,
    needsOnchainEnrich: !(row.has_onchain_metadata ?? false),
    displayName:       row.name ?? row.symbol ?? row.onchain_metadata?.name ?? null,
  };
}
  // ─────────────────────────────────────────────
  // LIFECYCLE
  // ─────────────────────────────────────────────

  async markProcessed(mint: MintLike): Promise<IdLike> {
    const res = await this.db.query<{ id: IdLike }>(
      QueryRegistry.MARK_PROCESSED,
      [mint]
    );
    if (!res.rows[0]?.id) {
      throw new Error('markProcessed(): metadata not found');
    }
    return firstRowIdOrNull(res);
  }
}

export function createMetaDataRepository(
  db: DatabaseClient
): MetaDataRepository {
  return new MetaDataRepository(db);
}