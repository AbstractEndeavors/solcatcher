import { getSafeLength, getPubkey, PublicKey } from './imports.js';
export function normalizeSignature(value) {
    if (typeof value === "string") {
        const s = value.trim();
        return s.length ? s : null;
    }
    if (value && typeof value === "object") {
        const sig = value.signature;
        if (typeof sig === "string" && sig.trim().length) {
            return sig.trim();
        }
    }
    return null;
}
export function isSignature(value) {
    return normalizeSignature(value) !== null;
}
export function isSignatureArray(value) {
    return (Array.isArray(value) &&
        value.length > 0 &&
        value.every(isSignature));
}
export const isSignatures = isSignatureArray;
export function getSignatureDicts(params) {
    return params.obj || params.signatures || params.signaturesDicts || params.signaturesDict || params.signatureDicts || params.signatureDict;
}
export function normalizeSigs(obj) {
    let signatures = obj?.result;
    if (signatures) {
        return signatures;
    }
    let rows = obj?.rows;
    if (rows) {
        if (getSafeLength(rows) >= 1) {
            let row = rows[0];
            if (row) {
                signatures = row?.signatures;
                if (signatures) {
                    return signatures;
                }
            }
        }
    }
    signatures = obj?.rows;
    if (signatures) {
        return signatures;
    }
    return obj;
}
function getEffectiveTime(sig) {
    if (typeof sig?.blockTime === "number") {
        return sig.blockTime;
    }
    if (typeof sig?.slot === "number") {
        return sig.slot;
    }
    return 0; // absolute fallback
}
export function shouldReturnSignature(signature, confirmationStatus = null, err = null) {
    if (!signature)
        return false;
    // ─────────────────────────────────────────────
    // Error filter (tri-state)
    // ─────────────────────────────────────────────
    if (err !== null) {
        const hasError = signature.err != null;
        if (err !== hasError)
            return false;
    }
    // ─────────────────────────────────────────────
    // Confirmation status filter
    // ─────────────────────────────────────────────
    if (confirmationStatus !== null &&
        signature.confirmationStatus !== confirmationStatus) {
        return false;
    }
    return true;
}
export function getFilteredSignatures(params) {
    const obj = getSignatureDicts(params);
    if (!obj)
        return obj;
    const signatures = normalizeSigs(obj);
    if (!Array.isArray(signatures))
        return signatures;
    const { confirmationStatus = null, err = null } = params;
    return signatures.filter(sig => shouldReturnSignature(sig, confirmationStatus, err));
}
export function sortSignatures(obj, confirmationStatus = null, err = null, direction = "desc") {
    const signatureDicts = getFilteredSignatures({ obj, confirmationStatus, err });
    if (!Array.isArray(signatureDicts)) {
        return signatureDicts;
    }
    return [...signatureDicts].sort((a, b) => {
        const aTime = getEffectiveTime(a);
        const bTime = getEffectiveTime(b);
        if (aTime === bTime) {
            // secondary tiebreaker: slot (guaranteed monotonic)
            const aSlot = typeof a?.slot === "number" ? a.slot : 0;
            const bSlot = typeof b?.slot === "number" ? b.slot : 0;
            return direction === "asc"
                ? aSlot - bSlot
                : bSlot - aSlot;
        }
        return direction === "asc"
            ? aTime - bTime
            : bTime - aTime;
    });
}
export function getAnySignature(obj, i = null) {
    obj = normalizeSigs(obj);
    if (!Array.isArray(obj)) {
        if (typeof obj === 'string') {
            return obj;
        }
        return null;
    }
    if (i === null) {
        i = 0;
    }
    if (getSafeLength(obj) > i) {
        obj = obj[i];
    }
    if (obj?.signature) {
        return obj.signature;
    }
}
export function getAnySignatureString(input) {
    return getAnySignature(input);
}
// utils/txnUtils.ts
export function getBlockTimeFromTxn(txn) {
    return Number(txn?.blockTime ?? 0);
}
export function getErrorMessageFromTxn(txn) {
    return txn?.err ?? null;
}
export function filterErrorless(signatures) {
    return (signatures ?? []).filter((s) => getErrorMessageFromTxn(s) === null);
}
export function oldestSignature(signatures, errorless = true) {
    if (!signatures || signatures.length === 0)
        return null;
    const usable = errorless ? filterErrorless(signatures) : signatures;
    if (usable.length === 0)
        return null;
    const first = usable[0];
    const last = usable[usable.length - 1];
    return getBlockTimeFromTxn(first) < getBlockTimeFromTxn(last)
        ? first.signature
        : last.signature;
}
export const METAPLEX_PROGRAM_ID = getPubkey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");
export function getMetadataPda(mint) {
    mint = getPubkey(mint);
    return PublicKey.findProgramAddressSync([
        Buffer.from("metadata"),
        METAPLEX_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
    ], METAPLEX_PROGRAM_ID)[0];
}
