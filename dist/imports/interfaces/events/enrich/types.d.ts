import type { MetaDataEnrichmentRow, PairEnrichmentRow, IdLike, MintLike, AddressLike, SigLike, IntLike, StringLike, DecodedCreateEvents, DecodedTradeEvents, AllDeps, PipelineDeps } from './imports.ts';
import type { FetchTxnParams } from '@imports';
export type EnrichFields = {
    pair: string[];
    meta: string[];
};
export interface FetchMetaDataEnrich {
    pair?: PairEnrichmentRow;
    meta_id?: IdLike;
    mint?: MintLike;
    program_id?: AddressLike;
}
export interface FetchPairDataEnrich {
    pair?: PairEnrichmentRow;
    pair_id?: IdLike;
    mint?: MintLike;
    program_id?: AddressLike;
}
export interface CreateContextEnrich {
    pair?: PairEnrichmentRow;
    pair_id?: IdLike;
    log_id?: IdLike;
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
    enrich_fields?: EnrichFields;
    invocation_index?: IntLike;
    decoded?: any;
    decode_summary?: any;
}
export interface EnrichPairResult {
    pair_id: IdLike;
    enriched_fields: string[];
    signature_found: boolean;
    status: 'complete' | 'partial' | 'unchanged';
}
export interface EnrichMetadataResult {
    meta_id: IdLike;
    enriched_onchain: boolean;
    enriched_offchain: boolean;
    status: 'complete' | 'partial' | 'unchanged';
}
export interface LogIntakePayload {
    id?: IdLike;
    log_id?: IdLike;
    program_id: AddressLike;
    signature: SigLike;
    slot: IntLike;
    logs_b64: string;
}
export interface CreateEventEntryPayload extends DecodedCreateEvents {
}
export interface TradeEventEntryPayload extends DecodedTradeEvents {
}
export interface LogEntryPayload {
    id?: IdLike;
    log_id?: IdLike;
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
export interface EnrichParams extends FetchTxnParams {
    meta?: MetaDataEnrichmentRow;
    pair?: PairEnrichmentRow;
    id?: IdLike;
    mint?: MintLike;
    pair_id?: IdLike;
    signature?: SigLike;
    meta_id?: IdLike;
    program_id?: AddressLike;
    decoded?: any;
    decode_summary?: any;
}
export interface EnrichOutput extends MetaDataEnrichParams, PairsEnrichParams {
    pair?: PairEnrichmentRow;
    meta?: MetaDataEnrichmentRow;
    id?: IdLike;
}
/** Schema for enrichment context - explicit state container */
export interface EnrichmentContext {
    readonly pair_id?: IdLike;
    readonly meta_id?: IdLike;
    readonly mint: MintLike;
    readonly program_id?: AddressLike;
    decoded: any;
    decode_summary: any;
    pair: PairEnrichmentRow;
    meta: MetaDataEnrichmentRow;
    enrich_fields: {
        pair: string[];
        meta: string[];
    };
}
export type Enricher = (ctx: EnrichmentContext, deps: PipelineDeps | AllDeps | null) => Promise<EnrichmentContext>;
