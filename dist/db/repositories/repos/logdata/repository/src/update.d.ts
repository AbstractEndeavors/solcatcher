import type { LogDataRepository } from "./../LogDataRepository.js";
import type { RepoResult } from '@imports';
export declare function update(this: LogDataRepository, params: any): Promise<RepoResult<ReturnType<LogDataRepository['rowToModel']>>>;
