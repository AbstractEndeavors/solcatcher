import { LogPayloadRepository } from './imports.js';
import type { LimitLike, StringLike, LogPayloadRow } from './imports.js';
export declare function fetchByDiscriminator(this: LogPayloadRepository, a?: unknown, b?: unknown, c?: unknown): Promise<LogPayloadRow[]>;
export declare function fetchByDiscriminatorOldest(this: LogPayloadRepository, discriminator: StringLike, limit?: LimitLike): Promise<LogPayloadRow[]>;
export declare function fetchByDiscriminatorLatest(this: LogPayloadRepository, discriminator: StringLike, limit?: LimitLike): Promise<LogPayloadRow[]>;
