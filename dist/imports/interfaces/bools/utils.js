export function normalizeBool(v) {
    if (typeof v === "boolean")
        return v;
    if (typeof v === "string") {
        if (v === "true")
            return true;
        if (v === "false")
            return false;
    }
    if (typeof v === "number") {
        if (v === 1)
            return true;
        if (v === 0)
            return false;
    }
    return null;
}
export function toBool(value, defaultValue = false) {
    const normalized = normalizeBool(value);
    return normalized ?? defaultValue;
}
export function isBool(value) {
    return normalizeBool(value) !== null;
}
export function isBoolFalse(value) {
    return normalizeBool(value) === false;
}
export function isTruthyBool(value) {
    return normalizeBool(value) === true;
}
export function isFalsyBool(value) {
    return normalizeBool(value) === false;
}
