import { isSignature, normalizeSignature, PublicKey, bs58 } from './imports.js';
/* ============================================================================
 * KEY MANAGER
 * ========================================================================== */
class KeyManager {
    pubkeyCache = new Map();
    signatureCache = new Map();
    /* ------------------------------
     * Guards
     * ------------------------------ */
    isPubkey(v) {
        return v instanceof PublicKey;
    }
    isValidBase58(v) {
        if (typeof v !== "string")
            return false;
        try {
            bs58.decode(v);
            return true;
        }
        catch {
            return false;
        }
    }
    /* ------------------------------
     * PUBLIC KEYS
     * ------------------------------ */
    getPubkey(input) {
        if (this.isPubkey(input))
            return input;
        if (!this.isValidBase58(input)) {
            throw new Error(`Invalid base58 pubkey: ${String(input)}`);
        }
        const cached = this.pubkeyCache.get(input);
        if (cached)
            return cached;
        const pk = new PublicKey(input);
        this.pubkeyCache.set(input, pk);
        return pk;
    }
    getPubkeyString(input) {
        return this.getPubkey(input).toBase58();
    }
    /* ------------------------------
     * SIGNATURES
     * ------------------------------ */
    getSignature(input) {
        if (isSignature(input))
            return input;
        if (!this.isValidBase58(input)) {
            throw new Error(`Invalid base58 signature: ${String(input)}`);
        }
        const cached = this.signatureCache.get(input);
        if (cached)
            return cached;
        const sig = normalizeSignature(input);
        this.signatureCache.set(input, sig);
        return sig;
    }
    getSignatureString(input) {
        return this.getSignature(input);
    }
    /* ------------------------------
     * GENERIC BASE58
     * ------------------------------ */
    normalizeBase58(input) {
        if (this.isPubkey(input))
            return input.toBase58();
        if (isSignature(input))
            return normalizeSignature(input);
        if (!this.isValidBase58(input)) {
            throw new Error(`Invalid base58 value: ${String(input)}`);
        }
        return input;
    }
    /* ------------------------------
     * MAINTENANCE
     * ------------------------------ */
    clear() {
        this.pubkeyCache.clear();
        this.signatureCache.clear();
    }
}
/* ============================================================================
 * SINGLETON
 * ========================================================================== */
export const keyManager = new KeyManager();
/* ============================================================================
 * FUNCTIONAL WRAPPERS (OPTIONAL)
 * ========================================================================== */
export const isPubkey = (v) => keyManager.isPubkey(v);
export const getPubkey = (v) => keyManager.getPubkey(v);
export const getPubkeyString = (v) => keyManager.getPubkeyString(v);
export const getSignature = (v) => normalizeSignature(v);
export const getSignatureString = (v) => keyManager.getSignatureString(v);
export const getBase58 = (v) => keyManager.normalizeBase58(v);
