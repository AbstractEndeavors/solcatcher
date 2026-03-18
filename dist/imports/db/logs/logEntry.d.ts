import type { AllDeps } from '@repoServices';
import type { ClassifiedEvent, QueueHandler, RepoResult, LogDataRow } from '@imports';
export declare function logEntry(payload: RepoResult<LogDataRow>, deps?: AllDeps | null): Promise<ClassifiedEvent[]>;
export declare function createLogEntryHandler(deps?: AllDeps | null): QueueHandler<'logEntry'>;
