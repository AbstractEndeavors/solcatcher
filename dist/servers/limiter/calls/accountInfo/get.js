import { getFetchManager } from '@rateLimiter';
export async function fetchAccountInfo(options) {
    const limiter = await getFetchManager();
    const result = await limiter.getAccountInfo(options);
    return result;
}
