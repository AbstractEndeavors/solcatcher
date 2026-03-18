import { getSafeLength, decodeStringB64, encodeDataB64 } from './imports.js';
export function normalizeLogId(input) {
    if (typeof input === "number")
        return input;
    if (input && typeof input === "object" && typeof input.id === "number") {
        return input.id;
    }
    return null;
}
export function logsContain(logs, needle) {
    if (!Array.isArray(logs))
        return false;
    for (const line of logs) {
        if (typeof line === 'string' && line.includes(needle)) {
            return true;
        }
    }
    return false;
}
export function parsedLogsContain(logs, needle) {
    if (!Array.isArray(logs))
        return false;
    for (const entry of logs) {
        if (entry &&
            typeof entry === "object" &&
            Array.isArray(entry.logs)) {
            for (const line of entry.logs) {
                if (typeof line === "string" && line.includes(needle)) {
                    return true;
                }
            }
        }
    }
    return false;
}
export function flattenInvocations(invocations, out = []) {
    for (const inv of invocations) {
        out.push(inv);
        if (getSafeLength(inv.children)) {
            flattenInvocations(inv.children, out);
        }
    }
    return out;
}
export function flattenInvocationsWithData(invocations, out = []) {
    if (!Array.isArray(invocations))
        return out;
    for (const inv of invocations) {
        if (Array.isArray(inv?.data) && inv.data.length > 0) {
            out.push(inv);
        }
        if (Array.isArray(inv?.children)) {
            flattenInvocationsWithData(inv.children, out);
        }
    }
    return out;
}
export function encodeLogsB64(logs) {
    return encodeDataB64(logs);
}
export function decodeLogsB64(b64) {
    return decodeStringB64(b64);
}
export function expectOk(r) {
    if (!r.ok || r.value == null) {
        throw new Error(r.reason ?? 'expected RepoResult.ok');
    }
    return r.value;
}
export function expectRepoValue(result, context) {
    if (!result.ok) {
        throw new Error(context
            ? `${context}: ${result.reason ?? 'repo_error'}`
            : result.reason ?? 'repo_error');
    }
    if (result.value == null) {
        throw new Error(context
            ? `${context}: expected value, got null`
            : 'expected value, got null');
    }
    return result.value;
}
