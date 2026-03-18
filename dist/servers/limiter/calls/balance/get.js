import { getFetchManager } from '@rateLimiter';
export async function fetchBalance(options) {
    const limiter = await getFetchManager();
    const result = await limiter.getBalance(options);
    return result;
}
