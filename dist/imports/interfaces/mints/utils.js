/* -------------------------------------------------- */
/* Validation primitive                               */
/* -------------------------------------------------- */
const BASE58_MINT_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
export function isValidMint(value) {
    return BASE58_MINT_RE.test(value.trim());
}
/* -------------------------------------------------- */
/* Core — everything else funnels through here        */
/* -------------------------------------------------- */
const DEFAULT_MINT_FIELDS = ['mint', 'mintAddress', 'mint_address'];
export function normalizeMintFields(input, fields = DEFAULT_MINT_FIELDS) {
    // bare string — validate directly
    if (typeof input === 'string') {
        const s = input.trim();
        return isValidMint(s) ? s : null;
    }
    if (input && typeof input === 'object') {
        const keys = Array.isArray(fields) ? fields : [fields];
        for (const key of keys) {
            const raw = input[key];
            if (typeof raw === 'string') {
                const s = raw.trim();
                if (isValidMint(s))
                    return s;
            }
        }
    }
    return null;
}
/* -------------------------------------------------- */
/* All other helpers delegate — no re-implementation  */
/* -------------------------------------------------- */
export function normalizeMint(value) {
    return normalizeMintFields(value);
}
export function isMint(value) {
    return normalizeMintFields(value) !== null;
}
export function isMintArray(value) {
    return Array.isArray(value) && value.length > 0 && value.every(isMint);
}
export const isMints = isMintArray;
export function firstNormalizedMint(...values) {
    for (const v of values) {
        const m = normalizeMintFields(v);
        if (m != null)
            return m;
    }
    return null;
}
export function extractMint(value) {
    return normalizeMintFields(value);
}
export const getMintOrNull = extractMint;
