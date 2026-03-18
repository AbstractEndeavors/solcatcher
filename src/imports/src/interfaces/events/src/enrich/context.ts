import type {
  MetaDataEnrichmentRow,
  PairEnrichmentRow,
  IdLike,MintLike,
  AddressLike,
  SigLike,
  IntLike,
  AllDeps
} from './imports.ts';
export type EnrichFields = {pair:string[],meta:string[]}
export interface CreateContextEnrich{
    pair?: PairEnrichmentRow;
    pair_id?: IdLike;
    log_id?:IdLike;
    meta?: MetaDataEnrichmentRow;
    meta_id?: IdLike;
    pairEnrich?: boolean;
    metaEnrich?: boolean;
    mint?: MintLike;
    txn_id?: IdLike;
    program_id?: AddressLike;
    invocation?: IntLike;
    slot?: IntLike;
    signature?: SigLike;
    enrich_fields?:EnrichFields,
    invocation_index?:IntLike,
    decoded?:any,
    decode_summary?:any
  }
/** Schema for enrichment context - explicit state container */
export interface EnrichmentContext {
  // Input identifiers
  pair_id?: IdLike;
  meta_id?: IdLike;
  mint: MintLike;
  program_id?: AddressLike;
  decoded?:any,
  decode_summary?:any
  // Loaded entities (mutable for enrichment)
  pair: PairEnrichmentRow;
  meta: MetaDataEnrichmentRow;
  enrich_fields:{pair:string[],meta:string[]}
}
export type Enricher = (
  ctx: EnrichmentContext,
  deps: AllDeps
) => Promise<EnrichmentContext>;
