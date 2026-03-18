import { type IdLike, type OnchainMetadataPayload, type MetaDataEnrichParams } from '@imports';
import { type AllDeps, type PipelineDeps } from '@repoServices';
export declare function upsertOnchainMetaData(chainData: OnchainMetadataPayload, payload?: MetaDataEnrichParams | null, deps?: PipelineDeps | AllDeps | null): Promise<IdLike | null>;
export declare function upsertOffchainMetaData(chainData: OnchainMetadataPayload, payload?: MetaDataEnrichParams | null, deps?: PipelineDeps | AllDeps | null): Promise<IdLike | null>;
