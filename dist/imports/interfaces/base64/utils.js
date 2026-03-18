/**
 * Base64 → Buffer
 */
export function decodeBase64ProgramData(data) {
    return Buffer.from(data, "base64");
}
/**
 * Read helpers
 */
export function readU64LE(buf, offset) {
    return buf.readBigUInt64LE(offset);
}
export function encodeDataB64(data) {
    return Buffer.from(JSON.stringify(data), "utf8").toString("base64");
}
export function decodeStringB64(b64) {
    return JSON.parse(decodeBase64ProgramData(b64).toString("utf8"));
}
