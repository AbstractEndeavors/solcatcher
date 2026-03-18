import { LogPayloadRepository } from './imports.js';
import type { AddressLike, IntLike } from './imports.js';
export declare function fetchDiscriminatorEvents(this: LogPayloadRepository): Promise<Map<string, string[]>>;
export declare function fetchDiscriminatorVersions(this: LogPayloadRepository): Promise<Map<string, IntLike>>;
export declare function fetchDiscriminatorProgramFrequency(this: LogPayloadRepository): Promise<Map<string, Map<AddressLike, IntLike>>>;
export declare function countByProgram(this: LogPayloadRepository): Promise<Map<AddressLike, IntLike>>;
export declare function countUnprocessed(this: LogPayloadRepository): Promise<IntLike>;
