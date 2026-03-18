import type {Base64String} from './types.js'
/**
 * Base64 → Buffer
 */
export function decodeBase64ProgramData(data: string): Buffer {
  return Buffer.from(data, "base64");
}
/**
 * Read helpers
 */
export function readU64LE(buf: Buffer, offset: number): bigint {
  return buf.readBigUInt64LE(offset);
}

export function encodeDataB64(data: unknown): Base64String {
  return Buffer.from(JSON.stringify(data), "utf8").toString("base64") as Base64String;
}

export function decodeStringB64(b64: Base64String): unknown {
  return JSON.parse(decodeBase64ProgramData(b64).toString("utf8"));
}
