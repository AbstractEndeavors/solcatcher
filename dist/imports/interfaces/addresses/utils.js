import { isValidBase58 } from './imports.js';
export function normalizeAddress(input, label = "address") {
    if (!input) {
        return input;
        //throw new Error(`normalizeAddress(${label}): empty value`);
    }
    // Already PublicKey
    if (input?.toBase58 instanceof Function) {
        return input.toBase58();
    }
    // Parsed instruction object
    if (typeof input === "object") {
        if (typeof input.pubkey === "string") {
            return input.pubkey;
        }
        if (typeof input.address === "string") {
            return input.address;
        }
    }
    // Raw string
    if (typeof input === "string") {
        if (!isValidBase58(input)) {
            throw new Error(`normalizeAddress(${label}): invalid base58 "${input}"`);
        }
        return input;
    }
    throw new Error(`normalizeAddress(${label}): unsupported type ${typeof input}`);
}
export function isAddress(value) {
    return normalizeAddress(value) !== null;
}
