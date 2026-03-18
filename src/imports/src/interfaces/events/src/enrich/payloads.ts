import type {
  IdLike,MintLike,
  AddressLike,
  SigLike,
  IntLike,
  StringLike,
  PairRow,
} from './imports.ts';
import {
   type DerivedPDAsResult
} from '@rateLimiter';
// ═══════════════════════════════════════════════════════════
// PAYLOAD SCHEMAS
// ═══════════════════════════════════════════════════════════
export interface LogIntakePayload {
  id?:IdLike
  log_id?:IdLike
  program_id: AddressLike;
  signature: SigLike;
  slot: IntLike;
  logs_b64: string;
}

export interface LogEntryPayload {
  id?:IdLike
  log_id?:IdLike
  program_id: string;
  signature: string;
  slot: number;
  logs_b64: string;
}
export interface TxnEntryPayload {
  id?: IdLike;
  signature?: SigLike;
}

export interface OnchainEnrichPayload {
  meta_id: IdLike;
  mint: MintLike;
  program_id: AddressLike;
}
export interface MetaDataEnrichParams {
  meta_id?: IdLike;
  mint?: MintLike;
  publicKey?: MintLike;
  program_id?: AddressLike;
  uri?: StringLike;
}
export interface PairsEnrichParams {
  pair_id?: IdLike;
  mint?: MintLike;
  program_id?: AddressLike;
}
export interface SignatureCallPayload {
  address: AddressLike;
  until?: SigLike;
  before?: SigLike;
  limit?: number;
}
export interface MetaEnrichPayload {
  meta_id?: IdLike;
  mint?: MintLike;
  program_id?: AddressLike;
  uri?: StringLike;
}
export interface GenesisEnrichPayload  extends DerivedPDAsResult{
}
export interface GenesisLookupPayload {
  id?:IdLike;
  pair_id?:IdLike;
  mint: MintLike;
  program_id: AddressLike;
}
export interface GenesisEntryPayload {
  id:IdLike
  mint: MintLike;
  program_id: AddressLike;
  signature?: SigLike;
}
export interface PairIngestPayload {
  pair?: PairRow;
  id?: IdLike;
  mint?: string;
  pair_id?: IdLike;
}

export interface PairEnrichPayload {
  pair?: PairRow;
  id?: IdLike;
  mint?: MintLike;
  pair_id?: IdLike;
  program_id?: AddressLike;
}

export interface EnrichmentTask {
  queue: 'pairEnrich' | 'metaEnrich' | 'genesisLookup';
  payload: PairEnrichPayload | MetaEnrichPayload | GenesisLookupPayload;
}

