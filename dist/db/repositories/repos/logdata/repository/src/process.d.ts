import type { LogDataRepository } from "./../LogDataRepository.js";
import type { IdLike, SigLike, RepoResult } from '@imports';
export declare function markProcessed(this: LogDataRepository, params: {
    id?: IdLike;
    signature?: SigLike;
}): Promise<RepoResult<IdLike>>;
export declare function markProcessedById(this: LogDataRepository, id: IdLike): Promise<RepoResult<IdLike>>;
export declare function markProcessedBySignature(this: LogDataRepository, signature: SigLike): Promise<RepoResult<IdLike>>;
export declare function markProcessedBatch(this: LogDataRepository, params: {
    ids?: IdLike[];
    signatures?: SigLike[];
}): Promise<RepoResult<IdLike[]>>;
export declare function markProcessedBatchByIds(this: LogDataRepository, ids: IdLike[]): Promise<RepoResult<IdLike[]>>;
export declare function markProcessedBatchBySignatures(this: LogDataRepository, signatures: SigLike[]): Promise<RepoResult<IdLike[]>>;
