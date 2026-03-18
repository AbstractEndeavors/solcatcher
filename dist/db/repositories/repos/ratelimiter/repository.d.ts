/**
 * RATE LIMITER REPOSITORY
 *
 * Consolidated repository for rate limiting data.
 * All operations in one place - no inheritance needed.
 *
 * Pattern: Explicit operations over generic abstractions
 */
import type { DatabaseClient } from '@imports';
import { RateEventRow, CooldownRow, MethodLimitsRow, UrlRegistryRow, AddRateEventParams, SetCooldownParams, UpsertMethodLimitsParams, UpsertUrlRegistryParams, AddUrlVariantParams, UpsertStateParams, UpsertLastMbParams, QueryRecentEventsParams, QueryCooldownParams, QueryMethodLimitsParams, QueryUrlByIdentifierParams, QueryVariantsByIdentifierParams, QueryIdentifierByVariantParams, QueryStateValueParams, QueryLastMbParams, QueryLastMbForNetlocParams } from './schemas.js';
export declare class RateLimiterRepository {
    private readonly db;
    constructor(db: DatabaseClient);
    createTables(): Promise<void>;
    addRateEvent(params: AddRateEventParams): Promise<void>;
    getRecentEvents(params: QueryRecentEventsParams): Promise<RateEventRow[]>;
    pruneOldEvents(before: number): Promise<void>;
    setCooldown(params: SetCooldownParams): Promise<void>;
    getCooldown(params: QueryCooldownParams): Promise<CooldownRow | null>;
    clearExpiredCooldowns(now: number): Promise<void>;
    upsertMethodLimits(params: UpsertMethodLimitsParams): Promise<void>;
    getMethodLimits(params: QueryMethodLimitsParams): Promise<MethodLimitsRow | null>;
    upsertUrlRegistry(params: UpsertUrlRegistryParams): Promise<void>;
    getUrlByIdentifier(params: QueryUrlByIdentifierParams): Promise<UrlRegistryRow | null>;
    getAllUrlRegistry(): Promise<UrlRegistryRow[]>;
    addUrlVariant(params: AddUrlVariantParams): Promise<void>;
    getVariantsByIdentifier(params: QueryVariantsByIdentifierParams): Promise<string[]>;
    getIdentifierByVariant(params: QueryIdentifierByVariantParams): Promise<string | null>;
    clearUrlVariants(identifier: string): Promise<void>;
    upsertState(params: UpsertStateParams): Promise<void>;
    getStateValue(params: QueryStateValueParams): Promise<string | null>;
    getAllState(): Promise<Map<string, string>>;
    upsertLastMb(params: UpsertLastMbParams): Promise<void>;
    getLastMb(params: QueryLastMbParams): Promise<number | null>;
    getAllLastMbForNetloc(params: QueryLastMbForNetlocParams): Promise<Map<string, number>>;
}
export declare function createRateLimiterRepository(db: DatabaseClient): RateLimiterRepository;
