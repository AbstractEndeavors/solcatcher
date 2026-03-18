import { LogPayloadRow, LogPayloadRepository } from './imports.js';
import type { IdLike } from './imports.js';
export declare function markProcessed(this: LogPayloadRepository, id: IdLike): Promise<LogPayloadRow | null>;
export declare function markFailed(this: LogPayloadRepository, id: IdLike): Promise<LogPayloadRow | null>;
export declare function setDecodedData(this: LogPayloadRepository, id: IdLike, data: Record<string, unknown>): Promise<Record<string, unknown>>;
export declare function setDecodable(this: LogPayloadRepository, id: IdLike): Promise<LogPayloadRow | null>;
export declare function setUndecodable(this: LogPayloadRepository, id: IdLike): Promise<LogPayloadRow | null>;
