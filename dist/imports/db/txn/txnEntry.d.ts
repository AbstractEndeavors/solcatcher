import { type AllDeps } from '@repoServices';
import { type QueueHandler, type ClassifiedEvent } from '@imports';
export declare function txnEntry(events: ClassifiedEvent[], deps?: AllDeps | null): Promise<null>;
export declare function createTxnEntryHandler(deps?: AllDeps | null): QueueHandler<'txnEntry'>;
