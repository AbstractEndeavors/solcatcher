import { getFetchManager } from '@rateLimiter';
export async function fetchSignaturesForAddress(options, fallback = false) {
    const limiter = await getFetchManager();
    const result = await limiter.getSignaturesForAddress(options, fallback);
    // ✅ PARSE STRING, NOT RESPONSE
    try {
        return result;
    }
    catch (err) {
        throw new Error(`Failed to parse JSON (${options} bytes): ${err instanceof Error ? err.message : String(err)}`);
    }
}
