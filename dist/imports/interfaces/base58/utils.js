// src/pipeline/bootstrap/normalizeTxnContext.ts
import { SOLANA_PUMP_FUN_PROGRAM_ID, bs58, PublicKey } from "./imports.js";
import { BASE58_REGEX } from './constants.js';
// src/utils/solana/isValidBase58.ts
export function readPubkey(buf, offset) {
    return bs58.encode(buf.subarray(offset, offset + 32));
}
export function isValidBase58(value, minLen = 32, maxLen = 64) {
    if (typeof value !== "string")
        return false;
    if (!BASE58_REGEX.test(value))
        return false;
    return value.length >= minLen && value.length <= maxLen;
}
export function normalizeBase58(input, label = "address") {
    if (!input) {
        throw new Error(`normalizeBase58(${label}): empty value`);
    }
    // string
    if (typeof input === "string") {
        if (!isValidBase58(input)) {
            throw new Error(`Invalid Base58 ${label}: ${input}`);
        }
        return input;
    }
    // PublicKey
    if (input instanceof PublicKey) {
        return input.toBase58();
    }
    // parsed account shape { pubkey }
    if (typeof input === "object" &&
        input !== null &&
        "pubkey" in input) {
        const pk = input.pubkey;
        return normalizeBase58(pk, `${label}.pubkey`);
    }
    throw new Error(`normalizeBase58(${label}): unsupported type ${typeof input}`);
}
export function normalizeTxnContext(txnMsg) {
    return {
        ...txnMsg,
        signature: normalizeBase58(txnMsg.signature, "signature"),
        program_id: normalizeBase58(txnMsg.program_id ?? SOLANA_PUMP_FUN_PROGRAM_ID, "program_id"),
    };
}
