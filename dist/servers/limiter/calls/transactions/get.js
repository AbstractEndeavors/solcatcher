import { getFetchManager } from '@rateLimiter';
import { transformSolanaTransaction, expectOk } from '@imports';
export async function fetchTransactionRaw(options) {
    const limiter = await getFetchManager();
    options.encoding = options.encoding || "base64";
    const result = await limiter.getTransaction(options);
    return result;
}
export async function fetchTransaction(options) {
    try {
        const limiter = await getFetchManager();
        options.encoding ??= 'base64';
        const tx = await fetchTransactionRaw(options);
        if (!tx) {
            return {
                ok: false,
                value: null,
                reason: 'transaction_not_found',
                meta: { signature: options.signature },
            };
        }
        return {
            ok: true,
            value: {
                signature: options.signature,
                tx,
            },
        };
    }
    catch (err) {
        return {
            ok: false,
            value: null,
            reason: 'fetch_transaction_failed',
            meta: { err: String(err), signature: options.signature },
        };
    }
}
export async function fetchTxnInsertData(options) {
    const response = await fetchTransaction(options);
    const tx = expectOk(response);
    return transformSolanaTransaction(tx);
}
