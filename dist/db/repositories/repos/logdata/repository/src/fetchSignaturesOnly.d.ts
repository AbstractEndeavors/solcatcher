import type { LogDataRepository } from "./../LogDataRepository.js";
import type { IdLike, SigLike, LimitLike, BoolLike, RepoResult } from '@imports';
export declare function fetchSignaturesOnly(this: LogDataRepository, params: {
    id?: IdLike;
    signature?: SigLike;
    limit?: LimitLike;
    latest?: BoolLike;
}): Promise<RepoResult<SigLike[]>>;
export declare function fetchSignaturesOnlyById(this: LogDataRepository, id: IdLike): Promise<RepoResult<SigLike[]>>;
export declare function fetchSignaturesOnlyBySignature(this: LogDataRepository, signature: SigLike): Promise<RepoResult<SigLike[]>>;
export declare function fetchSignaturesOnlyByLimit(this: LogDataRepository, params: {
    limit?: LimitLike;
    latest?: BoolLike;
}): Promise<RepoResult<SigLike[]>>;
export declare function fetchSignaturesOnlyByLimitOldest(this: LogDataRepository, limit?: LimitLike): Promise<RepoResult<SigLike[]>>;
export declare function fetchSignaturesOnlyByLimitLatest(this: LogDataRepository, limit?: LimitLike): Promise<RepoResult<SigLike[]>>;
