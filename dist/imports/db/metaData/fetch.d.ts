import { type OnchainMetadataPayload, type MetaDataEnrichParams, type StringLike } from '@imports';
export declare function fetchOnchainMetaData(payload: MetaDataEnrichParams): Promise<OnchainMetadataPayload | null>;
export declare function fetchOffchainJson(uri: StringLike): Promise<any | null>;
