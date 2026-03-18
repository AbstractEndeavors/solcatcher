/**
 * RPC Cache Policy Registry
 *
 * Categories:
 *   - Dynamic:    Never cache (state changes between calls)
 *   - Static:     Cache forever (genesis hash, version)
 *   - Immutable:  Cache forever once fetched (historical blocks/txns)
 *   - QuasiStatic: Short TTL (epoch info, leader schedule)
 *   - CommitmentDependent: TTL varies by commitment level
 */
// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────
const TTL = {
    NEVER: 0,
    FOREVER: null,
    QUASI_STATIC: 60_000, // 1 minute
    COMMITMENT: {
        processed: 0, // never cache
        confirmed: 10_000, // 10 seconds
        finalized: 300_000, // 5 minutes
    },
};
// ─────────────────────────────────────────────
// METHOD REGISTRY
// ─────────────────────────────────────────────
const METHOD_CATEGORIES = {
    // Dynamic - NEVER cache
    requestAirdrop: "dynamic",
    sendTransaction: "dynamic",
    sendRawTransaction: "dynamic",
    simulateTransaction: "dynamic",
    postSendWithConfirm: "dynamic",
    validatorExit: "dynamic",
    getSignaturesForAddress: "dynamic",
    getSignatureStatuses: "dynamic",
    // Static - cache FOREVER
    getGenesisHash: "static",
    getIdentity: "static",
    getVersion: "static",
    getEpochSchedule: "static",
    getInflationGovernor: "static",
    getMinimumLedgerSlot: "static",
    // Immutable - cache FOREVER (historical data)
    getBlock: "immutable",
    getBlockTime: "immutable",
    getBlockCommitment: "immutable",
    getTransaction: "immutable",
    getConfirmedTransaction: "immutable",
    confirmTransaction: "immutable",
    // Quasi-Static - short TTL
    getEpochInfo: "quasi_static",
    getLeaderSchedule: "quasi_static",
    getSlotLeader: "quasi_static",
    getRecentPerformanceSamples: "quasi_static",
    getVoteAccounts: "quasi_static",
    getInflationRate: "quasi_static",
    getClusterNodes: "quasi_static",
    // Commitment-Dependent - TTL varies
    getBlockHeight: "commitment_dependent",
    getSlot: "commitment_dependent",
    getTransactionCount: "commitment_dependent",
    getSupply: "commitment_dependent",
    getLatestBlockhash: "commitment_dependent",
    getBalance: "commitment_dependent",
    getAccountInfo: "commitment_dependent",
};
// ─────────────────────────────────────────────
// POLICY RESOLVER
// ─────────────────────────────────────────────
export function getCachePolicy(method, commitment = "confirmed") {
    const category = METHOD_CATEGORIES[method] ?? "dynamic"; // default: don't cache unknowns
    switch (category) {
        case "dynamic":
            return { category, ttlMs: TTL.NEVER };
        case "static":
        case "immutable":
            return { category, ttlMs: TTL.FOREVER };
        case "quasi_static":
            return { category, ttlMs: TTL.QUASI_STATIC };
        case "commitment_dependent":
            return { category, ttlMs: TTL.COMMITMENT[commitment] };
        default:
            return { category: "dynamic", ttlMs: TTL.NEVER };
    }
}
export function shouldCache(method, commitment) {
    const policy = getCachePolicy(method, commitment);
    return policy.ttlMs !== 0;
}
export function getCategory(method) {
    return METHOD_CATEGORIES[method] ?? "dynamic";
}
// ─────────────────────────────────────────────
// RPC CACHE
// ─────────────────────────────────────────────
export class RpcCache {
    cache = new Map();
    maxSize;
    constructor(maxSize = 10_000) {
        this.maxSize = maxSize;
    }
    /**
     * Build cache key from method + params
     */
    static buildKey(method, params) {
        return `${method}:${JSON.stringify(params)}`;
    }
    /**
     * Get cached value if valid
     */
    get(key) {
        const entry = this.cache.get(key);
        if (!entry)
            return null;
        // ttlMs === null means forever
        if (entry.ttlMs === null) {
            return entry.value;
        }
        // Check expiration
        const age = Date.now() - entry.cachedAt;
        if (age > entry.ttlMs) {
            this.cache.delete(key);
            return null;
        }
        return entry.value;
    }
    /**
     * Set value with policy-driven TTL
     */
    set(key, value, method, commitment = "confirmed") {
        const policy = getCachePolicy(method, commitment);
        // Don't cache if TTL is 0
        if (policy.ttlMs === 0)
            return;
        // Evict oldest if at capacity
        if (this.cache.size >= this.maxSize) {
            const oldest = this.cache.keys().next().value;
            if (oldest)
                this.cache.delete(oldest);
        }
        this.cache.set(key, {
            value,
            cachedAt: Date.now(),
            ttlMs: policy.ttlMs,
        });
    }
    /**
     * Check if we should fetch or use cache
     */
    shouldFetch(key) {
        return this.get(key) === null;
    }
    /**
     * Clear all or by prefix
     */
    clear(prefix) {
        if (!prefix) {
            this.cache.clear();
            return;
        }
        for (const key of this.cache.keys()) {
            if (key.startsWith(prefix)) {
                this.cache.delete(key);
            }
        }
    }
    /**
     * Invalidate by method (e.g., after a write operation)
     */
    invalidateMethod(method) {
        this.clear(`${method}:`);
    }
    /**
     * Stats for debugging
     */
    stats() {
        const methods = {};
        for (const key of this.cache.keys()) {
            const method = key.split(":")[0];
            methods[method] = (methods[method] ?? 0) + 1;
        }
        return { size: this.cache.size, methods };
    }
}
