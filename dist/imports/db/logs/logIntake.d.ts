import type { QueueHandler, RepoResult, LogIntakePayload, LogDataRow } from '@imports';
import { type AllDeps } from '@repoServices';
import type { LogDataRepository } from '@repositories/logdata/index.js';
export declare function logInsert(payload: LogIntakePayload, deps?: AllDeps | null): Promise<RepoResult<LogDataRow>>;
export declare function createLogIntakeHandler(logDataRepo: LogDataRepository): QueueHandler<'logIntake'>;
