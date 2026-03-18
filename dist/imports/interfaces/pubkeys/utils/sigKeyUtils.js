import { bs58 } from "./imports.js";
/**
 * Check if value is a valid Solana transaction signature
 */
export function isSigkey(obj) {
    if (typeof obj !== "string")
        return false;
    try {
        const decoded = bs58.decode(obj);
        return decoded.length === 64; // ed25519 signature length
    }
    catch {
        return false;
    }
}
/**
 * Normalize input to TransactionSignature
 */
export function getSigkey(obj) {
    if (isSigkey(obj))
        return obj;
    throw new Error("Invalid Solana transaction signature");
}
