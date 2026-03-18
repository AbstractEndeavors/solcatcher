import type { QueueHandler } from '@imports';
import type { AllDeps } from '@repoServices';
export declare function createTradeEventEntryHandler(deps?: AllDeps | null): QueueHandler<'tradeEventEntry'>;
export declare function createCreateEventEntryHandler(deps?: AllDeps | null): QueueHandler<'createEventEntry'>;
