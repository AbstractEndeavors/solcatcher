import { type OnchainMetadataPayload, type EnrichOnchainParams, type ChainFetchResult, type OffchainFetchResult, type EnrichOffchainParams } from '@imports';
export declare function buildEnrichOnchainParams(result: OnchainMetadataPayload | ChainFetchResult): EnrichOnchainParams;
export declare function buildEnrichOffchainParams(offchain: OffchainFetchResult): EnrichOffchainParams;
