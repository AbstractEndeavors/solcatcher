/**
 * RATE LIMITER REPOSITORY
 *
 * Consolidated repository for rate limiting data.
 * All operations in one place - no inheritance needed.
 *
 * Pattern: Explicit operations over generic abstractions
 */
import { QueryRegistry } from './query-registry.js';
import { RateEventRow, CooldownRow, MethodLimitsRow, UrlRegistryRow, UrlVariantRow, StateRow, LastMbRow, AddRateEventParams, SetCooldownParams, UpsertMethodLimitsParams, UpsertUrlRegistryParams, AddUrlVariantParams, UpsertStateParams, UpsertLastMbParams, QueryRecentEventsParams, QueryCooldownParams, QueryMethodLimitsParams, QueryUrlByIdentifierParams, QueryVariantsByIdentifierParams, QueryIdentifierByVariantParams, QueryStateValueParams, QueryLastMbParams, QueryLastMbForNetlocParams, } from './schemas.js';
// ============================================================
// REPOSITORY
// ============================================================
export class RateLimiterRepository {
    db;
    constructor(db) {
        this.db = db;
    }
    // ──────────────────────────────────────────────────────
    // SETUP
    // ──────────────────────────────────────────────────────
    async createTables() {
        // Create all tables
        await this.db.query(QueryRegistry.CREATE_TABLES.RATE_EVENTS);
        await this.db.query(QueryRegistry.CREATE_TABLES.COOLDOWNS);
        await this.db.query(QueryRegistry.CREATE_TABLES.METHOD_LIMITS);
        await this.db.query(QueryRegistry.CREATE_TABLES.URL_REGISTRY);
        await this.db.query(QueryRegistry.CREATE_TABLES.URL_VARIANTS);
        await this.db.query(QueryRegistry.CREATE_TABLES.RATE_LIMITER_STATE);
        await this.db.query(QueryRegistry.CREATE_TABLES.LAST_MB_TRACKING);
        // Create indexes
        for (const indexQuery of QueryRegistry.CREATE_INDEXES) {
            await this.db.query(indexQuery);
        }
    }
    // ──────────────────────────────────────────────────────
    // RATE EVENTS (Sliding window tracking)
    // ──────────────────────────────────────────────────────
    async addRateEvent(params) {
        await this.db.query(QueryRegistry.ADD_RATE_EVENT, [params.netloc, params.method, params.time, params.data]);
    }
    async getRecentEvents(params) {
        const result = await this.db.query(QueryRegistry.GET_RECENT_EVENTS, [params.netloc, params.method, params.since]);
        // Note: id is not returned by this query, so we use 0 as placeholder
        return result.rows.map((row, index) => new RateEventRow(index, params.netloc, params.method, row.time, row.data));
    }
    async pruneOldEvents(before) {
        await this.db.query(QueryRegistry.PRUNE_OLD_EVENTS, [before]);
    }
    // ──────────────────────────────────────────────────────
    // COOLDOWNS
    // ──────────────────────────────────────────────────────
    async setCooldown(params) {
        await this.db.query(QueryRegistry.UPSERT_COOLDOWN, [params.netloc, params.method, params.until]);
    }
    async getCooldown(params) {
        const result = await this.db.query(QueryRegistry.GET_COOLDOWN, [params.netloc, params.method]);
        const row = result.rows[0];
        return row
            ? new CooldownRow(params.netloc, params.method, row.until)
            : null;
    }
    async clearExpiredCooldowns(now) {
        await this.db.query(QueryRegistry.CLEAR_EXPIRED_COOLDOWNS, [now]);
    }
    // ──────────────────────────────────────────────────────
    // METHOD LIMITS
    // ──────────────────────────────────────────────────────
    async upsertMethodLimits(params) {
        await this.db.query(QueryRegistry.UPSERT_METHOD_LIMITS, [
            params.netloc,
            params.method,
            params.rate_limit ?? null,
            params.rps_limit ?? null,
            params.retry_after ?? null,
            params.avg_data ?? null,
            params.last_data ?? null,
        ]);
    }
    async getMethodLimits(params) {
        const result = await this.db.query(QueryRegistry.GET_METHOD_LIMITS, [params.netloc, params.method]);
        const row = result.rows[0];
        return row
            ? new MethodLimitsRow(params.netloc, params.method, row.rate_limit, row.rps_limit, row.retry_after, row.avg_data, row.last_data)
            : null;
    }
    // ──────────────────────────────────────────────────────
    // URL REGISTRY
    // ──────────────────────────────────────────────────────
    async upsertUrlRegistry(params) {
        await this.db.query(QueryRegistry.UPSERT_URL_REGISTRY, [
            params.identifier,
            params.netloc,
            params.scheme,
            params.name,
            params.ext,
        ]);
    }
    async getUrlByIdentifier(params) {
        const result = await this.db.query(QueryRegistry.GET_URL_BY_IDENTIFIER, [params.identifier]);
        const row = result.rows[0];
        return row
            ? new UrlRegistryRow(params.identifier, row.netloc, row.scheme, row.name, row.ext)
            : null;
    }
    async getAllUrlRegistry() {
        const result = await this.db.query(QueryRegistry.GET_URL_REGISTRY);
        return result.rows.map((row) => new UrlRegistryRow(row.identifier, row.netloc, row.scheme, row.name, row.ext));
    }
    // ──────────────────────────────────────────────────────
    // URL VARIANTS
    // ──────────────────────────────────────────────────────
    async addUrlVariant(params) {
        await this.db.query(QueryRegistry.ADD_URL_VARIANT, [params.identifier, params.variant]);
    }
    async getVariantsByIdentifier(params) {
        const result = await this.db.query(QueryRegistry.GET_VARIANTS_BY_IDENTIFIER, [params.identifier]);
        return result.rows.map((row) => row.variant);
    }
    async getIdentifierByVariant(params) {
        const result = await this.db.query(QueryRegistry.GET_IDENTIFIER_BY_VARIANT, [params.variant]);
        return result.rows[0]?.identifier ?? null;
    }
    async clearUrlVariants(identifier) {
        await this.db.query(QueryRegistry.CLEAR_URL_VARIANTS, [identifier]);
    }
    // ──────────────────────────────────────────────────────
    // STATE TRACKING
    // ──────────────────────────────────────────────────────
    async upsertState(params) {
        const now = Math.floor(Date.now() / 1000);
        await this.db.query(QueryRegistry.UPSERT_STATE, [params.key, params.value, now]);
    }
    async getStateValue(params) {
        const result = await this.db.query(QueryRegistry.GET_STATE_VALUE, [params.key]);
        return result.rows[0]?.value ?? null;
    }
    async getAllState() {
        const result = await this.db.query(QueryRegistry.GET_ALL_STATE);
        const state = new Map();
        for (const row of result.rows) {
            state.set(row.key, row.value);
        }
        return state;
    }
    // ──────────────────────────────────────────────────────
    // LAST MB TRACKING
    // ──────────────────────────────────────────────────────
    async upsertLastMb(params) {
        const now = Math.floor(Date.now() / 1000);
        await this.db.query(QueryRegistry.UPSERT_LAST_MB, [params.netloc, params.method, params.last_mb, now]);
    }
    async getLastMb(params) {
        const result = await this.db.query(QueryRegistry.GET_LAST_MB, [params.netloc, params.method]);
        return result.rows[0]?.last_mb ?? null;
    }
    async getAllLastMbForNetloc(params) {
        const result = await this.db.query(QueryRegistry.GET_ALL_LAST_MB_FOR_NETLOC, [params.netloc]);
        const lastMb = new Map();
        for (const row of result.rows) {
            lastMb.set(row.method, row.last_mb);
        }
        return lastMb;
    }
}
// ============================================================
// FACTORY (Explicit environment wiring)
// ============================================================
export function createRateLimiterRepository(db) {
    return new RateLimiterRepository(db);
}
