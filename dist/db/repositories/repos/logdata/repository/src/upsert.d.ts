import type { LogDataRepository } from "./../LogDataRepository.js";
import type { IdLike, SigLike, DataLike, RepoResult } from '@imports';
export declare function upsertParsedLogs(this: LogDataRepository, params: {
    id?: IdLike;
    signature?: SigLike;
    parsed_logs: DataLike;
}): Promise<RepoResult<IdLike>>;
export declare function upsertParsedLogsById(this: LogDataRepository, id: IdLike, parsed_logs: DataLike): Promise<RepoResult<IdLike>>;
export declare function upsertParsedLogsBySignature(this: LogDataRepository, signature: SigLike, parsed_logs: DataLike): Promise<RepoResult<IdLike>>;
