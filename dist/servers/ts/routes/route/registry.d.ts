/**
 * ROUTE REGISTRY
 *
 * Centralized route definitions.
 * Single source of truth for all API endpoints.
 *
 * Pattern: Registry over scattered definitions
 */
export declare const RouteRegistry: {
    readonly LOGDATA_FETCH_BY_ID: {
        readonly method: "GET";
        readonly path: "/logdata/:id";
        readonly handler: "logdata.fetchById";
        readonly description: "Fetch log data by ID";
    };
    readonly LOGDATA_FETCH_BY_SIGNATURE: {
        readonly method: "GET";
        readonly path: "/logdata/signature/:signature";
        readonly handler: "logdata.fetchBySignature";
        readonly description: "Fetch log data by signature";
    };
    readonly LOGDATA_FETCH_UNSORTED_LATEST: {
        readonly method: "GET";
        readonly path: "/logdata/unsorted/latest";
        readonly handler: "logdata.fetchUnsortedLatest";
        readonly description: "Fetch latest unsorted log data";
    };
    readonly LOGDATA_FETCH_UNSORTED_OLDEST: {
        readonly method: "GET";
        readonly path: "/logdata/unsorted/oldest";
        readonly handler: "logdata.fetchUnsortedOldest";
        readonly description: "Fetch oldest unsorted log data";
    };
    readonly LOGDATA_FETCH: {
        readonly method: "POST";
        readonly path: "/logdata/fetch";
        readonly handler: "logdata.fetch";
        readonly description: "Unified fetch with flexible parameters";
    };
    readonly TRANSACTIONS_FETCH_BY_ID: {
        readonly method: "GET";
        readonly path: "/transactions/:id";
        readonly handler: "transactions.fetchById";
        readonly description: "Fetch transaction by ID";
    };
    readonly TRANSACTIONS_FETCH_BY_SIGNATURE: {
        readonly method: "GET";
        readonly path: "/transactions/signature/:signature";
        readonly handler: "transactions.fetchBySignature";
        readonly description: "Fetch transaction by signature";
    };
    readonly PAIRS_FETCH_BY_ID: {
        readonly method: "GET";
        readonly path: "/pairs/:id";
        readonly handler: "pairs.fetchById";
        readonly description: "Fetch pair by ID";
    };
    readonly PAIRS_FETCH_BY_MINT: {
        readonly method: "GET";
        readonly path: "/pairs/mint/:mint";
        readonly handler: "pairs.fetchByMint";
        readonly description: "Fetch pair by mint address";
    };
    readonly PAIRS_FETCH_BY_MINT_AND_PROGRAM: {
        readonly method: "GET";
        readonly path: "/pairs/mint/:mint/program/:program_id";
        readonly handler: "pairs.fetchByMintAndProgram";
        readonly description: "Fetch pair by mint and program ID";
    };
    readonly HEALTH: {
        readonly method: "GET";
        readonly path: "/health";
        readonly handler: "health.check";
        readonly description: "Health check endpoint";
    };
};
export type RouteKey = keyof typeof RouteRegistry;
export type Route = typeof RouteRegistry[RouteKey];
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
