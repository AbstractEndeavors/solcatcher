import { normalizePositiveInt, normalizeBool, normalizeString } from "./imports.js";
function tokenize(arg) {
    const tokens = [];
    const l = normalizePositiveInt(arg);
    if (l !== null)
        tokens.push({ kind: "limit", value: l });
    const b = normalizeBool(arg);
    if (b !== null)
        tokens.push({ kind: "latest", value: b });
    const s = normalizeString(arg, "discriminator");
    if (s !== null)
        tokens.push({ kind: "string", value: s });
    return tokens;
}
export function normalizeFetchByDiscriminatorInput(a, b, c) {
    // defaults
    let limit = 100;
    let latest = false;
    let discriminator = null;
    // ─────────────────────────────────────────
    // CASE 1: dictionary/object input
    // ─────────────────────────────────────────
    if (a && typeof a === "object" && !Array.isArray(a)) {
        const obj = a;
        const l = normalizePositiveInt(obj.limit);
        const lt = normalizeBool(obj.latest);
        const di = normalizeString(obj, 'discriminator');
        if (l !== null)
            limit = l;
        if (lt !== null)
            latest = lt;
        if (di !== null)
            discriminator = di;
        return { limit, latest, discriminator };
    }
    // ─────────────────────────────────────────
    // CASE 2: positional inputs
    // ─────────────────────────────────────────
    const args = [a, b, c];
    for (const arg of args) {
        for (const token of tokenize(arg)) {
            switch (token.kind) {
                case "limit":
                    limit = token.value;
                    break;
                case "latest":
                    latest = token.value;
                    break;
                case "string":
                    discriminator = token.value;
                    break;
            }
        }
    }
    return { limit, latest, discriminator };
}
