import type { LogDataRepository } from "./../LogDataRepository.js";
import type { IdLike, SigLike, RepoResult } from '@imports';
export declare function markSorted(this: LogDataRepository, params: {
    id?: IdLike;
    signature?: SigLike;
    meta_id?: IdLike;
    pair_id?: IdLike;
    txn_id?: IdLike;
}): Promise<RepoResult<IdLike>>;
export declare function markSortedById(this: LogDataRepository, params: {
    id: IdLike;
    meta_id?: IdLike;
    pair_id?: IdLike;
    txn_id?: IdLike;
}): Promise<RepoResult<IdLike>>;
export declare function markSortedBySignature(this: LogDataRepository, params: {
    signature: SigLike;
    meta_id?: IdLike;
    pair_id?: IdLike;
    txn_id?: IdLike;
}): Promise<RepoResult<IdLike>>;
export declare function markSortedBatch(this: LogDataRepository, params: {
    ids?: IdLike[];
    signatures?: SigLike[];
    meta_id?: IdLike;
    pair_id?: IdLike;
    txn_id?: IdLike;
}): Promise<RepoResult<IdLike[]>>;
export declare function markSortedBatchByIds(this: LogDataRepository, params: {
    ids: IdLike[];
    meta_id?: IdLike;
    pair_id?: IdLike;
    txn_id?: IdLike;
}): Promise<RepoResult<IdLike[]>>;
export declare function markSortedBatchBySignatures(this: LogDataRepository, params: {
    signatures: SigLike[];
    meta_id?: IdLike;
    pair_id?: IdLike;
    txn_id?: IdLike;
}): Promise<RepoResult<IdLike[]>>;
