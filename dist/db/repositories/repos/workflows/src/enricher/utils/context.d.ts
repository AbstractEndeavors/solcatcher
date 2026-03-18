import { type PairEnrichmentRow, type MetaDataEnrichmentRow, type EnrichParams, type FetchPairDataEnrich, type FetchMetaDataEnrich, type CreateContextEnrich, type EnrichmentContext } from "@imports";
export declare function fetchPairDataEnrichmentRow(params: FetchPairDataEnrich): Promise<PairEnrichmentRow>;
export declare function getPairDataEnrichmentRow(params: EnrichParams): Promise<PairEnrichmentRow>;
export declare function fetchMetaDataEnrichmentRow(params: FetchMetaDataEnrich): Promise<MetaDataEnrichmentRow>;
export declare function getMetaDataEnrichmentRow(params: EnrichParams): Promise<MetaDataEnrichmentRow>;
/** Factory to create context - fetch once, use many */
export declare function createEnrichmentContext(params: CreateContextEnrich): Promise<EnrichmentContext>;
/** Factory to create context - fetch once, use many */
export declare function fetchEnrichmentContext(params: CreateContextEnrich): Promise<EnrichmentContext>;
