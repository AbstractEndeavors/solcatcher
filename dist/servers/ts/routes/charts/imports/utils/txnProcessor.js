/* ---------------------------------------------
 * Helpers
 * --------------------------------------------- */
// src/utils/replaceAll.ts
/* ---------------------------------------------
 * Small helpers
 * --------------------------------------------- */
// src/utils/txnMath.ts
/* ---------------------------------------------
 * Value extractors (faithful ports)
 * --------------------------------------------- */
export function getStringValue(txn, key) {
    let value = getKeyValue(txn, key);
    if (Array.isArray(value)) {
        value = Array.from(new Set(value));
    }
    return ifListGetSingle(value);
}
export function getIntegerValue(txn, key) {
    const value = getKeyValue(txn, key);
    return getZeroOrReal(value);
}
export function getBoolValue(txn, key) {
    const value = getKeyValue(txn, key);
    return Boolean(ifListGetSingle(value));
}
/* ---------------------------------------------
 * Domain-specific getters
 * --------------------------------------------- */
export const getTxnPrice = (txn) => getIntegerValue(txn, "price");
export const getVirtualSolReserves = (txn) => getKeyValue(txn, "virtual_sol_reserves");
export const getVirtualTokenReserves = (txn) => getKeyValue(txn, "virtual_token_reserves");
export const getUserAddress = (txn) => getStringValue(txn, "user_address");
export const getMint = (txn) => getStringValue(txn, "mint");
export const getBondingCurve = (txn) => getStringValue(txn, "bonding_curve");
export const getTimestamps = (txn) => getIntegerValue(txn, "timestamp");
export const getSolAmount = (txn) => getIntegerValue(txn, "sol_amount");
export const getTokenAmount = (txn) => getIntegerValue(txn, "token_amount");
export const getIsBuy = (txn) => getBoolValue(txn, "is_buy");
export const getSignature = (txn) => getStringValue(txn, "signature");
function makeList(value) {
    return Array.isArray(value) ? value : [value];
}
/* ---------------------------------------------
 * Core replace helpers
 * --------------------------------------------- */
export function replaceIt(str, item, rep) {
    if (!str || !item)
        return str;
    return str.includes(item) ? replaceAll(str, [item, rep]) : str;
}
export function whileReplace(str, item, rep) {
    if (!item)
        return str;
    while (true) {
        const next = replaceIt(str, item, rep);
        // stop if:
        // 1) nothing left to replace
        // 2) replacement reintroduces the item (would infinite loop)
        if (!next.includes(item) || rep.includes(item)) {
            return next;
        }
        str = next;
    }
}
export function forReplace(str, item, replace) {
    const replacements = makeList(replace);
    for (const rep of replacements) {
        str = whileReplace(str, item, rep);
    }
    return str;
}
/* ---------------------------------------------
 * replaceAll (main entry)
 * --------------------------------------------- */
export function replaceAll(str, ...args) {
    for (const items of args) {
        if (!items || !Array.isArray(items) || items.length === 0)
            continue;
        const item = items[0];
        const replace = items.length > 1 ? items.slice(1) : items[items.length - 1];
        str = forReplace(str, item, replace);
    }
    return str;
}
export function cleanInvalidNewlines(jsonString, lineReplacementValue = "") {
    /**
     * Removes invalid newlines from a JSON string that are NOT inside quotes.
     * Mirrors the Python regex behavior.
     */
    const pattern = /(?<!\\)\n(?!([^"]*"[^"]*")*[^"]*$)/g;
    return jsonString.replace(pattern, lineReplacementValue);
}
export function safeJsonLoads(input) {
    try {
        return JSON.parse(input);
    }
    catch {
        return null;
    }
}
export function readMalformedJson(jsonInput, lineReplacementValue = "*n*") {
    if (typeof jsonInput === "string") {
        const cleaned = cleanInvalidNewlines(jsonInput, lineReplacementValue);
        return safeJsonLoads(cleaned);
    }
    return jsonInput;
}
/* ---------------------------------------------
 * Path helpers (generic deep search)
 * --------------------------------------------- */
export function findPathsToKey(obj, key, path = []) {
    if (obj === null || typeof obj !== "object")
        return [];
    let results = [];
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
        results.push([...path, key]);
    }
    for (const k of Object.keys(obj)) {
        const v = obj[k];
        results = results.concat(findPathsToKey(v, key, [...path, k]));
    }
    return results;
}
export function getValueFromPath(obj, path) {
    return path.reduce((acc, key) => {
        if (acc == null)
            return undefined;
        return acc[key];
    }, obj);
}
/* ---------------------------------------------
 * Value extraction
 * --------------------------------------------- */
export function getAnyValue(jsonObj, key, lineReplacementValue = "*n*") {
    const jsonData = readMalformedJson(jsonObj, lineReplacementValue);
    const paths = findPathsToKey(jsonData, key);
    let values = paths.map(path => getValueFromPath(jsonData, path));
    values = values.map(v => typeof v === "string"
        ? replaceAll(v, [lineReplacementValue, "\n"])
        : v);
    if (values.length === 0)
        return null;
    if (values.length === 1)
        return values[0];
    return values;
}
/* ---------------------------------------------
 * List normalization
 * --------------------------------------------- */
export function ifListGetSingle(obj) {
    let out = obj;
    while (Array.isArray(out) && out.length === 1) {
        out = out[0];
    }
    return out;
}
export function getZeroOrReal(obj) {
    let out = ifListGetSingle(obj);
    if (Array.isArray(out) && out.length > 1) {
        out = out[0];
    }
    return out || 0;
}
/* ---------------------------------------------
 * Transaction helpers
 * --------------------------------------------- */
export function getKeyValue(txn, key) {
    if (Array.isArray(txn)) {
        if (txn.length && txn[0]?.tcns) {
            return getAnyValue(txn[0].tcns, key);
        }
        txn = ifListGetSingle(txn);
    }
    return getAnyValue(txn, key);
}
/* ---------------------------------------------
 * Flattening logic (tcns)
 * --------------------------------------------- */
export function flattenTxn(txn) {
    const flattened = [];
    const tcns = getAnyValue(txn, "tcns") || [];
    for (const tcn of tcns) {
        const merged = { ...txn, ...tcn };
        delete merged.tcns;
        flattened.push(merged);
    }
    return ifListGetSingle(flattened.length ? flattened : txn);
}
export function flattenTxnHistory(txns) {
    return (txns || [])
        .filter(Boolean)
        .map(txn => flattenTxn(txn));
}
/* ---------------------------------------------
 * Sorting helpers
 * --------------------------------------------- */
export function sortTxnHistory(txns) {
    return [...txns].sort((a, b) => getTimestamps(a) - getTimestamps(b));
}
export function getSortedTxnHistory(txns) {
    const flat = flattenTxnHistory(txns);
    return sortTxnHistory(makeList(flat));
}
export function getAllTimestamps(txns) {
    return makeList(txns)
        .map(txn => getTimestamps(txn))
        .sort((a, b) => a - b);
}
/* ---------------------------------------------
 * Math helpers
 * --------------------------------------------- */
export function getPrice(virtualSolReserves, virtualTokenReserves) {
    if (!virtualTokenReserves)
        return 0;
    return virtualSolReserves / virtualTokenReserves;
}
export function tallyProfits(txns = null) {
    const txnHistory = getSortedTxnHistory(txns || []);
    const txnData = {};
    for (const txn of makeList(txnHistory)) {
        let user = getUserAddress(txn);
        if (Array.isArray(user)) {
            user = user.filter(Boolean)[0] ?? null;
        }
        for (const tx of makeList(txn)) {
            if (!user)
                continue;
            if (!txnData[user]) {
                txnData[user] = {
                    profits: { sol: 0, token: 0 },
                    avgPrice: { token_amount: 0, sol: 0, avg: 0 },
                    volume: { buy: 0, sell: 0, total: 0 },
                    txns: [],
                };
            }
            const solAmt = getSolAmount(tx);
            const tknAmt = getTokenAmount(tx);
            txnData[user].volume.total += solAmt;
            if (tx?.isbuy) {
                txnData[user].volume.buy += solAmt;
                txnData[user].profits.sol -= solAmt;
            }
            else {
                txnData[user].volume.sell += solAmt;
                txnData[user].profits.sol += solAmt;
            }
            txnData[user].avgPrice.token_amount += tknAmt;
            txnData[user].avgPrice.sol += solAmt;
            const tokenAmt = txnData[user].avgPrice.token_amount || 1;
            txnData[user].avgPrice.avg =
                txnData[user].avgPrice.sol / tokenAmt;
            const sig = getSignature(tx);
            if (sig) {
                txnData[user].txns.push(sig);
            }
        }
    }
    return txnData;
}
