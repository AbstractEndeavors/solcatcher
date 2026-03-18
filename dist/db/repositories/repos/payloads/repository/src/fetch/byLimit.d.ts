import { type LimitLike, LogPayloadRepository, type LogPayloadRow } from './imports.js';
export declare function fetchByLimit(this: LogPayloadRepository, a?: unknown, b?: unknown): Promise<LogPayloadRow[]>;
export declare function fetchByLimitOldest(this: LogPayloadRepository, limit?: LimitLike): Promise<LogPayloadRow[]>;
export declare function fetchByLimitLatest(this: LogPayloadRepository, limit?: LimitLike): Promise<LogPayloadRow[]>;
