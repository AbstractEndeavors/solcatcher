import { createServer } from 'http';
import { limiterApp } from "./app.js";
import { getFetchManager } from "./../fetcher/makeCalls/index.js";
import { LIMITER_HOST, LIMITER_PORT } from './constants.js';
export async function startLimiterServer(port = null, host = null) {
    host = host || LIMITER_HOST;
    port = parseInt(port || LIMITER_PORT);
    const limiter = await getFetchManager();
    // 🔥 initialize services first
    const limitApp = await limiterApp(limiter);
    createServer(limitApp).listen(port, host, () => {
        console.log(`TS server running on ${host}:${port}`);
    });
}
