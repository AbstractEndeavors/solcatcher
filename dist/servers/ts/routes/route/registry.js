/**
 * ROUTE REGISTRY
 *
 * Centralized route definitions.
 * Single source of truth for all API endpoints.
 *
 * Pattern: Registry over scattered definitions
 */
// ============================================================
// ROUTE REGISTRY
// ============================================================
export const RouteRegistry = {
    // ────────────────────────────────────────────────────────
    // LOGDATA ROUTES
    // ────────────────────────────────────────────────────────
    LOGDATA_FETCH_BY_ID: {
        method: 'GET',
        path: '/logdata/:id',
        handler: 'logdata.fetchById',
        description: 'Fetch log data by ID'
    },
    LOGDATA_FETCH_BY_SIGNATURE: {
        method: 'GET',
        path: '/logdata/signature/:signature',
        handler: 'logdata.fetchBySignature',
        description: 'Fetch log data by signature'
    },
    LOGDATA_FETCH_UNSORTED_LATEST: {
        method: 'GET',
        path: '/logdata/unsorted/latest',
        handler: 'logdata.fetchUnsortedLatest',
        description: 'Fetch latest unsorted log data'
    },
    LOGDATA_FETCH_UNSORTED_OLDEST: {
        method: 'GET',
        path: '/logdata/unsorted/oldest',
        handler: 'logdata.fetchUnsortedOldest',
        description: 'Fetch oldest unsorted log data'
    },
    LOGDATA_FETCH: {
        method: 'POST',
        path: '/logdata/fetch',
        handler: 'logdata.fetch',
        description: 'Unified fetch with flexible parameters'
    },
    // ────────────────────────────────────────────────────────
    // TRANSACTIONS ROUTES
    // ────────────────────────────────────────────────────────
    TRANSACTIONS_FETCH_BY_ID: {
        method: 'GET',
        path: '/transactions/:id',
        handler: 'transactions.fetchById',
        description: 'Fetch transaction by ID'
    },
    TRANSACTIONS_FETCH_BY_SIGNATURE: {
        method: 'GET',
        path: '/transactions/signature/:signature',
        handler: 'transactions.fetchBySignature',
        description: 'Fetch transaction by signature'
    },
    // ────────────────────────────────────────────────────────
    // PAIRS ROUTES
    // ────────────────────────────────────────────────────────
    PAIRS_FETCH_BY_ID: {
        method: 'GET',
        path: '/pairs/:id',
        handler: 'pairs.fetchById',
        description: 'Fetch pair by ID'
    },
    PAIRS_FETCH_BY_MINT: {
        method: 'GET',
        path: '/pairs/mint/:mint',
        handler: 'pairs.fetchByMint',
        description: 'Fetch pair by mint address'
    },
    PAIRS_FETCH_BY_MINT_AND_PROGRAM: {
        method: 'GET',
        path: '/pairs/mint/:mint/program/:program_id',
        handler: 'pairs.fetchByMintAndProgram',
        description: 'Fetch pair by mint and program ID'
    },
    // ────────────────────────────────────────────────────────
    // HEALTH CHECK
    // ────────────────────────────────────────────────────────
    HEALTH: {
        method: 'GET',
        path: '/health',
        handler: 'health.check',
        description: 'Health check endpoint'
    },
};
