import { getPubkey, normalizeBase58 } from './../imports.js';
export function getAccountInfoBody(body) {
    const { account, commitment = "finalized", encoding = "base64", maxSupportedTransactionVersion = 0, offset = 0, length = 0, dataSlice } = body;
    if (!account)
        return null;
    const pubkeyStr = normalizeBase58(getPubkey(account));
    const slice = dataSlice ?? { offset, length };
    return {
        method: "getAccountInfo",
        params: [
            pubkeyStr,
            {
                encoding,
                commitment,
                maxSupportedTransactionVersion,
                ...slice
            }
        ]
    };
}
export function getResult(res) {
    if (res == null)
        return null;
    if (typeof res === "object" && "result" in res)
        return res.result;
    if (typeof res === "object" && "value" in res)
        return res.value;
    return res;
}
/**
 * Fetches signatures for a given address.
 *
 * @param account - The address to fetch signatures for.
 * @param until - Optional parameter to fetch signatures until a certain point.
 * @param limit - The maximum number of signatures to fetch.
 * @returns An array of signatures.
 */
export async function FetchAccountInfo(fm, options) {
    const body = getAccountInfoBody(options);
    if (!body)
        return null;
    const res = await fm.fetchRpc(body);
    const final = getResult(res);
    return final;
}
