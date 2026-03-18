import { getFetchManager } from '@rateLimiter';
export async function fetchRpc(options) {
    const limiter = await getFetchManager();
    const result = await limiter.fetchRpc(options);
    return result;
}
