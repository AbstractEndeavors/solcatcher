import type {
  MetaDataEnrichmentRow,
  PairEnrichmentRow,
  IdLike,MintLike,
  AddressLike,
  SigLike,
  FetchTxnParams,
} from './imports.ts';
import type {MetaDataEnrichParams,PairsEnrichParams} from './payloads.js'
export type EnrichStatus = 'complete' | 'partial' | 'unchanged'
// ═══════════════════════════════════════════════════════════
// ENRICHMENT RESULTS
// ═══════════════════════════════════════════════════════════
export interface EnrichPairResult {
  pair_id: IdLike;
  enriched_fields: string[];
  signature_found: boolean;
  status: EnrichStatus;
}
export interface EnrichMetadataResult {
  meta_id: IdLike;
  enriched_onchain: boolean;
  enriched_offchain: boolean;
  status: EnrichStatus;
}
export interface EnrichParams extends FetchTxnParams {
    meta?:MetaDataEnrichmentRow,
    pair?:PairEnrichmentRow,
    id?:IdLike,
    mint?:MintLike,
    pair_id?: IdLike,
    signature?: SigLike,
    meta_id?:IdLike,
    program_id?: AddressLike,
    decoded?:any,
    decode_summary?:any
  }
export interface EnrichOutput extends MetaDataEnrichParams,PairsEnrichParams {
  pair?:PairEnrichmentRow,
  meta?:MetaDataEnrichmentRow
  id?:IdLike,
}
