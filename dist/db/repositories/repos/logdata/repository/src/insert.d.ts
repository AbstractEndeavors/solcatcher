import type { LogDataRepository } from "./../LogDataRepository.js";
import { type IdLike, type SigLike, LogDataRow, type RepoResult } from '@imports';
export declare function insert(this: LogDataRepository, raw: any): Promise<RepoResult<LogDataRow>>;
export declare function insertBatch(this: LogDataRepository, rows: any[]): Promise<RepoResult<Map<SigLike, IdLike>>>;
export declare function insertUnknownInstruction(this: LogDataRepository, row: any): Promise<void>;
export declare function insertIntent(this: LogDataRepository, signature: SigLike): Promise<IdLike>;
