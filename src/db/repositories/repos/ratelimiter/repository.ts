/**
 * RATE LIMITER REPOSITORY
 * 
 * Consolidated repository for rate limiting data.
 * All operations in one place - no inheritance needed.
 * 
 * Pattern: Explicit operations over generic abstractions
 */

import type { DatabaseClient } from '@imports';
import { QueryRegistry } from './query-registry.js';
import {
  RateEventRow,
  CooldownRow,
  MethodLimitsRow,
  UrlRegistryRow,
  UrlVariantRow,
  StateRow,
  LastMbRow,
  AddRateEventParams,
  SetCooldownParams,
  UpsertMethodLimitsParams,
  UpsertUrlRegistryParams,
  AddUrlVariantParams,
  UpsertStateParams,
  UpsertLastMbParams,
  QueryRecentEventsParams,
  QueryCooldownParams,
  QueryMethodLimitsParams,
  QueryUrlByIdentifierParams,
  QueryVariantsByIdentifierParams,
  QueryIdentifierByVariantParams,
  QueryStateValueParams,
  QueryLastMbParams,
  QueryLastMbForNetlocParams,
} from './schemas.js';

// ============================================================
// REPOSITORY
// ============================================================

export class RateLimiterRepository {
  constructor(private readonly db: DatabaseClient) {}

  // ──────────────────────────────────────────────────────
  // SETUP
  // ──────────────────────────────────────────────────────

  async createTables(): Promise<void> {
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

  async addRateEvent(params: AddRateEventParams): Promise<void> {
    await this.db.query(
      QueryRegistry.ADD_RATE_EVENT,
      [params.netloc, params.method, params.time, params.data]
    );
  }

  async getRecentEvents(
    params: QueryRecentEventsParams
  ): Promise<RateEventRow[]> {
    const result = await this.db.query<{ time: number; data: number }>(
      QueryRegistry.GET_RECENT_EVENTS,
      [params.netloc, params.method, params.since]
    );

    // Note: id is not returned by this query, so we use 0 as placeholder
    return result.rows.map((row, index) => 
      new RateEventRow(index, params.netloc, params.method, row.time, row.data)
    );
  }

  async pruneOldEvents(before: number): Promise<void> {
    await this.db.query(QueryRegistry.PRUNE_OLD_EVENTS, [before]);
  }

  // ──────────────────────────────────────────────────────
  // COOLDOWNS
  // ──────────────────────────────────────────────────────

  async setCooldown(params: SetCooldownParams): Promise<void> {
    await this.db.query(
      QueryRegistry.UPSERT_COOLDOWN,
      [params.netloc, params.method, params.until]
    );
  }

  async getCooldown(
    params: QueryCooldownParams
  ): Promise<CooldownRow | null> {
    const result = await this.db.query<{ until: number }>(
      QueryRegistry.GET_COOLDOWN,
      [params.netloc, params.method]
    );

    const row = result.rows[0];
    return row
      ? new CooldownRow(params.netloc, params.method, row.until)
      : null;
  }

  async clearExpiredCooldowns(now: number): Promise<void> {
    await this.db.query(QueryRegistry.CLEAR_EXPIRED_COOLDOWNS, [now]);
  }

  // ──────────────────────────────────────────────────────
  // METHOD LIMITS
  // ──────────────────────────────────────────────────────

  async upsertMethodLimits(params: UpsertMethodLimitsParams): Promise<void> {
    await this.db.query(
      QueryRegistry.UPSERT_METHOD_LIMITS,
      [
        params.netloc,
        params.method,
        params.rate_limit ?? null,
        params.rps_limit ?? null,
        params.retry_after ?? null,
        params.avg_data ?? null,
        params.last_data ?? null,
      ]
    );
  }

  async getMethodLimits(
    params: QueryMethodLimitsParams
  ): Promise<MethodLimitsRow | null> {
    const result = await this.db.query<{
      rate_limit: number | null;
      rps_limit: number | null;
      retry_after: number | null;
      avg_data: number | null;
      last_data: number | null;
    }>(QueryRegistry.GET_METHOD_LIMITS, [params.netloc, params.method]);

    const row = result.rows[0];
    return row
      ? new MethodLimitsRow(
          params.netloc,
          params.method,
          row.rate_limit,
          row.rps_limit,
          row.retry_after,
          row.avg_data,
          row.last_data
        )
      : null;
  }

  // ──────────────────────────────────────────────────────
  // URL REGISTRY
  // ──────────────────────────────────────────────────────

  async upsertUrlRegistry(params: UpsertUrlRegistryParams): Promise<void> {
    await this.db.query(
      QueryRegistry.UPSERT_URL_REGISTRY,
      [
        params.identifier,
        params.netloc,
        params.scheme,
        params.name,
        params.ext,
      ]
    );
  }

  async getUrlByIdentifier(
    params: QueryUrlByIdentifierParams
  ): Promise<UrlRegistryRow | null> {
    const result = await this.db.query<{
      netloc: string;
      scheme: string;
      name: string;
      ext: string;
    }>(QueryRegistry.GET_URL_BY_IDENTIFIER, [params.identifier]);

    const row = result.rows[0];
    return row
      ? new UrlRegistryRow(
          params.identifier,
          row.netloc,
          row.scheme,
          row.name,
          row.ext
        )
      : null;
  }

  async getAllUrlRegistry(): Promise<UrlRegistryRow[]> {
    const result = await this.db.query<{
      identifier: string;
      netloc: string;
      scheme: string;
      name: string;
      ext: string;
    }>(QueryRegistry.GET_URL_REGISTRY);

    return result.rows.map(
      (row) =>
        new UrlRegistryRow(
          row.identifier,
          row.netloc,
          row.scheme,
          row.name,
          row.ext
        )
    );
  }

  // ──────────────────────────────────────────────────────
  // URL VARIANTS
  // ──────────────────────────────────────────────────────

  async addUrlVariant(params: AddUrlVariantParams): Promise<void> {
    await this.db.query(
      QueryRegistry.ADD_URL_VARIANT,
      [params.identifier, params.variant]
    );
  }

  async getVariantsByIdentifier(
    params: QueryVariantsByIdentifierParams
  ): Promise<string[]> {
    const result = await this.db.query<{ variant: string }>(
      QueryRegistry.GET_VARIANTS_BY_IDENTIFIER,
      [params.identifier]
    );

    return result.rows.map((row) => row.variant);
  }

  async getIdentifierByVariant(
    params: QueryIdentifierByVariantParams
  ): Promise<string | null> {
    const result = await this.db.query<{ identifier: string }>(
      QueryRegistry.GET_IDENTIFIER_BY_VARIANT,
      [params.variant]
    );

    return result.rows[0]?.identifier ?? null;
  }

  async clearUrlVariants(identifier: string): Promise<void> {
    await this.db.query(QueryRegistry.CLEAR_URL_VARIANTS, [identifier]);
  }

  // ──────────────────────────────────────────────────────
  // STATE TRACKING
  // ──────────────────────────────────────────────────────

  async upsertState(params: UpsertStateParams): Promise<void> {
    const now = Math.floor(Date.now() / 1000);
    await this.db.query(
      QueryRegistry.UPSERT_STATE,
      [params.key, params.value, now]
    );
  }

  async getStateValue(
    params: QueryStateValueParams
  ): Promise<string | null> {
    const result = await this.db.query<{ value: string }>(
      QueryRegistry.GET_STATE_VALUE,
      [params.key]
    );

    return result.rows[0]?.value ?? null;
  }

  async getAllState(): Promise<Map<string, string>> {
    const result = await this.db.query<{ key: string; value: string }>(
      QueryRegistry.GET_ALL_STATE
    );

    const state = new Map<string, string>();
    for (const row of result.rows) {
      state.set(row.key, row.value);
    }

    return state;
  }

  // ──────────────────────────────────────────────────────
  // LAST MB TRACKING
  // ──────────────────────────────────────────────────────

  async upsertLastMb(params: UpsertLastMbParams): Promise<void> {
    const now = Math.floor(Date.now() / 1000);
    await this.db.query(
      QueryRegistry.UPSERT_LAST_MB,
      [params.netloc, params.method, params.last_mb, now]
    );
  }

  async getLastMb(params: QueryLastMbParams): Promise<number | null> {
    const result = await this.db.query<{ last_mb: number }>(
      QueryRegistry.GET_LAST_MB,
      [params.netloc, params.method]
    );

    return result.rows[0]?.last_mb ?? null;
  }

  async getAllLastMbForNetloc(
    params: QueryLastMbForNetlocParams
  ): Promise<Map<string, number>> {
    const result = await this.db.query<{ method: string; last_mb: number }>(
      QueryRegistry.GET_ALL_LAST_MB_FOR_NETLOC,
      [params.netloc]
    );

    const lastMb = new Map<string, number>();
    for (const row of result.rows) {
      lastMb.set(row.method, row.last_mb);
    }

    return lastMb;
  }
}

// ============================================================
// FACTORY (Explicit environment wiring)
// ============================================================

export function createRateLimiterRepository(
  db: DatabaseClient
): RateLimiterRepository {
  return new RateLimiterRepository(db);
}
