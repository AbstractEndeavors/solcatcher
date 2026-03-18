import type { LimitLike, StringLike, IdLike, SigLike, BoolLike, LogPayloadRow } from './imports.js';
import { LogPayloadRepository } from './imports.js';
export declare function fetch(this: LogPayloadRepository, params: {
    id?: IdLike;
    signature?: SigLike;
    discriminator?: StringLike;
    limit?: LimitLike;
    latest?: BoolLike;
    unprocessed?: BoolLike;
}): Promise<LogPayloadRow[]>;
export declare function fetchById(this: LogPayloadRepository, id: IdLike): Promise<LogPayloadRow | null>;
export declare function fetchByIds(this: LogPayloadRepository, ids: IdLike[]): Promise<LogPayloadRow[]>;
export declare function fetchBySignature(this: LogPayloadRepository, signature: SigLike): Promise<LogPayloadRow[]>;
