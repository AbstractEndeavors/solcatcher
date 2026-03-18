// src/servers/fetcher/makeCalls/instance.ts
// FIXED: Validate rateLimiter before constructing FetchManager
import { FetchManager } from "./FetchManager.js";
import { getRepoServices } from '@repoServices';
import { getLogString } from '@imports';
import { initializeSchema } from '@db';
let _limiter = null;
let fetchManagerPromise = null;
export async function initFetchManager(ratelimiter = null, commitment = "confirmed") {
    // Return existing if already initialized
    if (_limiter) {
        return _limiter;
    }
    // Return in-progress initialization
    if (fetchManagerPromise) {
        return fetchManagerPromise;
    }
    // Start initialization
    fetchManagerPromise = (async () => {
        getLogString({
            logType: 'info',
            function_name: "initFetchManager",
            message: 'Starting FetchManager initialization'
        });
        // 1. Initialize schema first
        await initializeSchema();
        // 2. Get or validate rateLimiter
        let rateLimiter = ratelimiter;
        if (!rateLimiter) {
            getLogString({
                logType: 'info',
                function_name: "initFetchManager",
                message: 'Getting rateLimiter from getRepoServices.services()'
            });
            const services = await getRepoServices.repos();
            getLogString({
                logType: 'debug',
                function_name: "initFetchManager",
                message: 'Services returned',
                details: { keys: Object.keys(services) }
            });
            rateLimiter = services.rateLimiter;
        }
        // ✅ CRITICAL: Validate rateLimiter before proceeding
        if (!rateLimiter) {
            const error = new Error('initFetchManager: rateLimiter is undefined. ' +
                'Check that getRepoServices.services() returns { rateLimiter: RateLimiterService }');
            getLogString({
                logType: 'error',
                function_name: "initFetchManager",
                message: error.message
            });
            throw error;
        }
        // ✅ Validate rateLimiter has required methods
        if (typeof rateLimiter.fetchRpc !== 'function') {
            const error = new Error('initFetchManager: rateLimiter.fetchRpc is not a function. ' +
                `Got rateLimiter with keys: ${Object.keys(rateLimiter).join(', ')}`);
            getLogString({
                logType: 'error',
                function_name: "initFetchManager",
                message: error.message
            });
            throw error;
        }
        if (typeof rateLimiter.getUrl !== 'function') {
            const error = new Error('initFetchManager: rateLimiter.getUrl is not a function. ' +
                `Got rateLimiter with keys: ${Object.keys(rateLimiter).join(', ')}`);
            getLogString({
                logType: 'error',
                function_name: "initFetchManager",
                message: error.message
            });
            throw error;
        }
        // 3. Construct FetchManager
        getLogString({
            logType: 'info',
            function_name: "initFetchManager",
            message: 'Constructing FetchManager with validated rateLimiter'
        });
        _limiter = new FetchManager(rateLimiter, commitment);
        getLogString({
            logType: 'success',
            function_name: 'initFetchManager',
            message: 'FetchManager initialized successfully'
        });
        return _limiter;
    })();
    // Handle initialization failure
    try {
        return await fetchManagerPromise;
    }
    catch (err) {
        // Reset on failure so retry is possible
        fetchManagerPromise = null;
        _limiter = null;
        throw err;
    }
}
export async function getFetchManager() {
    if (_limiter) {
        return _limiter;
    }
    return initFetchManager();
}
// ─────────────────────────────────────────────
// DIAGNOSTIC EXPORT
// ─────────────────────────────────────────────
export function getFetchManagerStatus() {
    return {
        initialized: _limiter !== null,
        initializing: fetchManagerPromise !== null && _limiter === null,
    };
}
