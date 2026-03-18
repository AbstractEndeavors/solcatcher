import type { Base64String } from './types.js';
/**
 * Base64 → Buffer
 */
export declare function decodeBase64ProgramData(data: string): Buffer;
/**
 * Read helpers
 */
export declare function readU64LE(buf: Buffer, offset: number): bigint;
export declare function encodeDataB64(data: unknown): Base64String;
export declare function decodeStringB64(b64: Base64String): unknown;
