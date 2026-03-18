import type { LogDataRepository } from "./../LogDataRepository.js";
import type { LogDataRow, IdLike, SigLike, LimitLike, LogPayloadContext, RepoResult } from '@imports';
export declare function fetch(this: LogDataRepository, params: {
    id?: IdLike;
    signature?: SigLike;
}): Promise<RepoResult<LogDataRow>>;
export declare function fetchMany(this: LogDataRepository, params: {
    limit?: LimitLike;
    latest?: boolean;
}): Promise<RepoResult<LogDataRow[]>>;
export declare function fetchByLimit(this: LogDataRepository, a?: unknown, b?: unknown): Promise<RepoResult<LogDataRow[]>>;
export declare function fetchByLimitOldest(this: LogDataRepository, limit?: LimitLike): Promise<RepoResult<LogDataRow[]>>;
export declare function fetchByLimitLatest(this: LogDataRepository, limit?: LimitLike): Promise<RepoResult<LogDataRow[]>>;
export declare function fetchById(this: LogDataRepository, id: IdLike): Promise<RepoResult<LogDataRow>>;
export declare function fetchBySignature(this: LogDataRepository, signature: SigLike): Promise<RepoResult<LogDataRow>>;
export declare function getContext(this: LogDataRepository, signature: SigLike): Promise<RepoResult<LogPayloadContext>>;
