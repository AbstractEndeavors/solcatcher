import { type EnrichmentContext, type EnrichmentDeps, type MetaDataEnrichParams, type StringLike, type AllDeps } from './imports.js';
export declare function getUri(payload?: MetaDataEnrichParams | null, deps?: AllDeps | null): Promise<StringLike>;
export declare function offChainEnrich(payload: MetaDataEnrichParams, deps?: AllDeps | null): Promise<MetaDataEnrichParams>;
export declare function onchainEnrich(payload: MetaDataEnrichParams, deps?: AllDeps | null): Promise<MetaDataEnrichParams>;
export declare function signatureMetaEnrich(payload: MetaDataEnrichParams, deps?: AllDeps | null): Promise<MetaDataEnrichParams>;
export declare function metaDataEnrich(payload: MetaDataEnrichParams, deps?: AllDeps | null): Promise<MetaDataEnrichParams>;
export declare function enrichPDAs(ctx: EnrichmentContext, _deps: EnrichmentDeps): Promise<EnrichmentContext>;
