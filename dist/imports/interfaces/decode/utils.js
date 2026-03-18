import { normalizeBase58, readU64LE, readPubkey, decodeBase64ProgramData, bs58 } from './imports.js';
export function normalizeDecodedData(data) {
    if (!data || typeof data !== "object")
        return data;
    return {
        ...data,
        mint: data.mint ? normalizeBase58(data.mint, "mint") : null,
        user_address: data.user_address
            ? normalizeBase58(data.user_address, "user_address")
            : null,
        bonding_curve: data.bonding_curve
            ? normalizeBase58(data.bonding_curve, "bonding_curve")
            : null,
        associated_bonding_curve: data.associated_bonding_curve
            ? normalizeBase58(data.associated_bonding_curve, "associated_bonding_curve")
            : null,
        creator_address: data.creator_address
            ? normalizeBase58(data.creator_address, "creator_address")
            : null,
    };
}
/**
 * Generic heuristic decoder
 */
export function heuristicDecodeProgramData(base64) {
    const buf = decodeBase64ProgramData(base64);
    const discriminator = buf.subarray(0, 8).toString("hex");
    const fields = {};
    let o = 8;
    // Common Pump / AMM patterns
    try {
        fields.lamports = readU64LE(buf, o);
        o += 8;
        fields.tokenAmount = readU64LE(buf, o);
        o += 8;
        fields.creator = readPubkey(buf, o);
        o += 32;
        fields.mint = readPubkey(buf, o);
        o += 32;
    }
    catch {
        // Partial decode is expected
    }
    return {
        discriminator,
        raw: buf,
        fields
    };
}
/* ──────────────────────────────────────────────
 * Primitive readers (NO side effects)
 * ────────────────────────────────────────────── */
export class Cursor {
    b;
    o;
    constructor(b, o = 0) {
        this.b = b;
        this.o = o;
    }
    u64() { const v = this.b.readBigUInt64LE(this.o); this.o += 8; return v; }
    pubkey() { const v = bs58.encode(this.b.subarray(this.o, this.o + 32)); this.o += 32; return v; }
}
export const u8 = (b, o) => b.readUInt8(o);
export const u64 = (b, o) => b.readBigUInt64LE(o);
export const i64 = (b, o) => b.readBigInt64LE(o);
export const pubkey = (b, o) => bs58.encode(b.subarray(o, o + 32));
export const str = (b, o) => {
    if (o + 4 > b.length) {
        throw new Error("str(): insufficient buffer for length");
    }
    const len = b.readUInt32LE(o);
    // hard sanity bounds
    if (len < 0 || len > 2048) {
        throw new Error(`str(): invalid length ${len}`);
    }
    const start = o + 4;
    const end = start + len;
    if (end > b.length) {
        throw new Error(`str(): buffer overflow (len=${len})`);
    }
    return {
        value: b
            .subarray(start, end)
            .toString("utf8")
            .replace(/\u0000/g, "")
            .trim(),
        next: end,
    };
};
/**
 * Type guard for decoded registry output.
 * Use this BEFORE destructuring decode() results.
 */
export function isDecodedResult(x) {
    return (x !== null &&
        typeof x === 'object' &&
        'name' in x &&
        'category' in x &&
        'data' in x &&
        typeof x.name === 'string' &&
        typeof x.category === 'string' &&
        typeof x.data === 'object');
}
