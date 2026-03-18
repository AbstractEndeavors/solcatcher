import { LogPayloadRepository } from './imports.js';
import type { LogPayloadRow, LimitLike } from './imports.js';
export declare function fetchByUnprocessed(this: LogPayloadRepository, a?: unknown, b?: unknown): Promise<LogPayloadRow[]>;
export declare function fetchByUnprocessedOldest(this: LogPayloadRepository, limit?: LimitLike): Promise<LogPayloadRow[]>;
export declare function fetchByUnprocessedLatest(this: LogPayloadRepository, limit?: LimitLike): Promise<LogPayloadRow[]>;
