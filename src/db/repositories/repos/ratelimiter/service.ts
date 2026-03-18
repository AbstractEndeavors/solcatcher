/**
 * RATE LIMITER SERVICE (REFACTORED)
 * 
 * Database-backed rate limiting with in-memory URL selection.
 * URL selection is FAST and SYNCHRONOUS - no DB queries in hot path.
 */

import { 
  type DatabaseClient, 
  type UrlDict, 
  type Commitment, 
  fetchRpc 
} from '@imports';
import { 
  RateLimiterRepository, 
  createRateLimiterRepository 
} from './repository.js';
import { 
  UrlSelectionRegistry, 
  UrlSelectionConfig, 
  createUrlSelectionRegistry 
} from './url-selection-registry.js';
import {
  AddRateEventParams,
  SetCooldownParams,
  UpsertMethodLimitsParams,
  UpsertUrlRegistryParams,
  AddUrlVariantParams,
  UpsertStateParams,
  UpsertLastMbParams,
  QueryCooldownParams,
  QueryMethodLimitsParams,
  QueryVariantsByIdentifierParams,
  DefaultLimits,
} from './schemas.js';
import {
  getCurrentTime,
  getJsonSizeInMb,
  getBaseDomain,
  getRetryAfter,
  getRemainingMethod,
  getMethodRateLimit,
  getRpsLimit
} from './utils.js';

// ============================================================
// SERVICE CONFIGURATION
// ============================================================

export interface RateLimiterServiceConfig {
  db: DatabaseClient;
  urls: UrlDict[];
  fallbackUrl: UrlDict;
  circuitBreakerThreshold?: number;
  circuitBreakerDuration?: number;
}

// ============================================================
// SERVICE
// ============================================================

export class RateLimiterService {
  private readonly repo: RateLimiterRepository;
  private readonly urlRegistry: UrlSelectionRegistry;  // ← NEW: single source of truth
  private readonly commitment: Commitment = "confirmed";
  
  readonly urls: UrlDict[];
  readonly fallbackUrl: UrlDict;
  readonly fallbackOnLimit: boolean = true;
  private readonly fallbackNetloc: string | null;

  // Simplified in-memory cache (still used for DB persistence)
  private urlRegistryDb: Map<string, { netloc: string; scheme: string; name: string; ext: string }>;
  private variantsMap: Map<string, string[]>;
  private variantsLookup: Map<string, string>;
  private lastMethod: string | null = null;
  private lastUrl: string | null = null;

  // Metrics (in-memory, for observability)
  private metrics: any = {
    allowed: 0,
    delayed: 0,
    skipped: 0,
    fallback: 0,
    byIntent: {
      authoritative: { allowed: 0, delayed: 0, skipped: 0, fallback: 0 },
      enrichment: { allowed: 0, delayed: 0, skipped: 0, fallback: 0 },
      repair: { allowed: 0, delayed: 0, skipped: 0, fallback: 0 },
    },
  };

  constructor(config: RateLimiterServiceConfig) {
    this.repo = createRateLimiterRepository(config.db);
    this.urls = config.urls;
    this.fallbackUrl = config.fallbackUrl;
    this.fallbackNetloc = this.fallbackUrl.netloc;
    
    // Initialize URL selection registry (in-memory, fast)
    this.urlRegistry = createUrlSelectionRegistry(
      new UrlSelectionConfig(
        config.urls,
        config.fallbackUrl,
        config.circuitBreakerThreshold || 3,
        config.circuitBreakerDuration || 60
      )
    );
    
    // Keep DB cache for persistence
    this.urlRegistryDb = new Map();
    this.variantsMap = new Map();
    this.variantsLookup = new Map();
  }

  // ────────────────────────────────────────────────────────
  // LIFECYCLE
  // ────────────────────────────────────────────────────────

  async start(): Promise<void> {
    try {
      await this.registerUrls(this.urls);
      await this.loadState();
      
      // Log registry health at startup
      const health = this.urlRegistry.getHealthSnapshot();
      console.log({
        logType: 'info',
        message: 'URL registry initialized',
        details: {
          urlCount: health.urls.length,
          urls: health.urls.map(u => ({ netloc: u.netloc, status: u.status }))
        }
      });
    } catch (err) {
      console.error({
        logType: 'error',
        function_name: 'RateLimiterService.start',
        message: 'Failed to start RateLimiterService',
        details: { error: err instanceof Error ? err.message : String(err) }
      });
      throw err;
    }
  }

  // ────────────────────────────────────────────────────────
  // URL REGISTRATION (Database persistence)
  // ────────────────────────────────────────────────────────

  private async registerUrls(urls: UrlDict[]): Promise<void> {
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      const { identifier, netloc, scheme, name, path, ext } = url;
      
      try {
        await this.repo.upsertUrlRegistry(
          new UpsertUrlRegistryParams(
            identifier,
            netloc,
            scheme,
            name ?? netloc,
            ext ?? 'default'
          )
        );
        
        const variants = [
          `${scheme}://${netloc}${path ?? ""}`,
          name ?? netloc,
        ];
        
        await this.repo.clearUrlVariants(netloc);
        for (const variant of variants) {
          await this.repo.addUrlVariant(
            new AddUrlVariantParams(identifier, variant)
          );
        }
        
        // Cache in memory
        this.urlRegistryDb.set(identifier, {
          netloc,
          scheme,
          name: name ?? netloc,
          ext: ext ?? 'default',
        });
        this.variantsMap.set(netloc, variants);
        this.variantsLookup.set(identifier, netloc);
        for (const v of variants) this.variantsLookup.set(v, netloc);
        
      } catch (err) {
        console.log({
          logType: 'error',
          function_name: 'RateLimiterService.registerUrls',
          message: 'Failed to register URL',
          details: {
            identifier,
            netloc,
            error: err instanceof Error ? err.message : String(err)
          }
        });
        throw err;
      }
    }
  }

  private async loadState(): Promise<void> {
    const state = await this.repo.getAllState();
    this.lastMethod = state.get('last_method') || null;
    this.lastUrl = state.get('last_url') || null;

    // Load URL registry from DB
    const urlEntries = await this.repo.getAllUrlRegistry();
    for (const entry of urlEntries) {
      this.urlRegistryDb.set(entry.identifier, {
        netloc: entry.netloc,
        scheme: entry.scheme,
        name: entry.name,
        ext: entry.ext,
      });

      const variants = await this.repo.getVariantsByIdentifier(
        new QueryVariantsByIdentifierParams(entry.identifier)
      );
      this.variantsMap.set(entry.identifier, variants);

      for (const variant of variants) {
        this.variantsLookup.set(variant, entry.identifier);
      }
    }
  }

  async saveState(): Promise<void> {
    if (this.lastMethod !== null) {
      await this.repo.upsertState(
        new UpsertStateParams('last_method', this.lastMethod)
      );
    }
    if (this.lastUrl !== null) {
      await this.repo.upsertState(
        new UpsertStateParams('last_url', this.lastUrl)
      );
    }
  }

  // ────────────────────────────────────────────────────────
  // URL SELECTION (NEW - FAST, NO DATABASE)
  // ────────────────────────────────────────────────────────

  /**
   * Get best available URL for the given method
   * FAST, SYNCHRONOUS, NO DATABASE QUERIES
   */
  getUrl(method: string, forceFallback: boolean = false): string {
    if (forceFallback) {
      return this.urlRegistry.getFallback();
    }
    
    const url = this.urlRegistry.getNextAvailable(method);
    
    // Update state tracking
    this.lastMethod = method;
    this.lastUrl = url;
    
    return url;
  }

  getFallbackUrl(method: any = null): string {
    return this.urlRegistry.getFallback();
  }

  /**
   * Get URL health status for monitoring
   */
  getUrlHealth(): any {
    return this.urlRegistry.getHealthSnapshot();
  }

  // ────────────────────────────────────────────────────────
  // URL RESOLUTION (Helper)
  // ────────────────────────────────────────────────────────

  private resolveNetloc(identifier: string): string | null {
    // Try registry first
    const netloc = this.urlRegistry.resolveNetloc(identifier);
    if (netloc) return netloc;
    
    // Fallback to DB cache
    if (this.urlRegistryDb.has(identifier)) {
      return identifier;
    }
    if (this.variantsLookup.has(identifier)) {
      return this.variantsLookup.get(identifier)!;
    }
    
    return getBaseDomain(identifier);
  }

  // ────────────────────────────────────────────────────────
  // METHOD LIMITS (Database-backed, for analytics)
  // ────────────────────────────────────────────────────────

  private async ensureMethodLimits(
    identifier: string,
    netloc: string,
    method: string
  ): Promise<void> {
    const existing = await this.repo.getMethodLimits(
      new QueryMethodLimitsParams(identifier, netloc, method)
    );

    if (!existing) {
      await this.repo.upsertMethodLimits(
        new UpsertMethodLimitsParams(identifier, netloc, method)
      );
    }
  }

  async getStateRateLimit(
    method: string,
    identifier: string,
    limitType: 'rate_limit' | 'rps_limit' | 'retry_after'
  ): Promise<number> {
    const defaultLimits = new DefaultLimits();

    const netloc = this.resolveNetloc(identifier);
    if (!netloc) {
      return defaultLimits[limitType];
    }

    await this.ensureMethodLimits(identifier, netloc, method);
    const limits = await this.repo.getMethodLimits(
      new QueryMethodLimitsParams(identifier, netloc, method)
    );

    return limits?.[limitType] ?? defaultLimits[limitType];
  }

  // ────────────────────────────────────────────────────────
  // HEADERS & RESPONSE PROCESSING
  // ────────────────────────────────────────────────────────

  async processHeaders(
    response: Response,
    method: string,
    identifier: string
  ): Promise<[number, number] | [null, null]> {
    const netloc = this.resolveNetloc(identifier);
    if (!netloc) {
      return [null, null];
    }

    await this.ensureMethodLimits(identifier, netloc, method);

    // Extract and store rate limits
    const rateLimit = getMethodRateLimit(response);
    if (rateLimit) {
      const existing = await this.repo.getMethodLimits(
        new QueryMethodLimitsParams(identifier, netloc, method)
      );
      if (!existing || existing.rate_limit !== rateLimit) {
        await this.repo.upsertMethodLimits(
          new UpsertMethodLimitsParams(identifier, netloc, method, rateLimit)
        );
      }
    }

    const rpsLimit = getRpsLimit(response);
    if (rpsLimit) {
      const existing = await this.repo.getMethodLimits(
        new QueryMethodLimitsParams(identifier, netloc, method)
      );
      if (!existing || existing.rps_limit !== rpsLimit) {
        await this.repo.upsertMethodLimits(
          new UpsertMethodLimitsParams(identifier, netloc, method, undefined, rpsLimit)
        );
      }
    }

    const retryAfter = getRetryAfter(response);
    const methodRemaining = getRemainingMethod(response);

    return [retryAfter, methodRemaining];
  }

  // ────────────────────────────────────────────────────────
  // COOLDOWNS (Legacy - kept for DB persistence)
  // ────────────────────────────────────────────────────────

  async setCooldown(
    netloc: string | null,
    method: string | null,
    add: number | false
  ): Promise<number | false> {
    if (!netloc || !method) {
      return false;
    }

    const resolvedNetloc = this.resolveNetloc(netloc);
    if (!resolvedNetloc) {
      return false;
    }

    if (add !== false) {
      const until = getCurrentTime() + add;
      await this.repo.setCooldown(
        new SetCooldownParams(resolvedNetloc, method, until)
      );
    }

    return this.getCooldownForMethod(resolvedNetloc, method);
  }

  async getCooldownForMethod(
    identifier: string,
    method: string
  ): Promise<number | false> {
    const netloc = this.resolveNetloc(identifier);
    if (!netloc) {
      return false;
    }

    const cooldown = await this.repo.getCooldown(
      new QueryCooldownParams(identifier, netloc, method)
    );

    if (!cooldown) {
      return false;
    }

    const waitTime = cooldown.remainingSeconds;
    if (waitTime <= 0) {
      await this.repo.clearExpiredCooldowns(getCurrentTime());
      return false;
    }

    return waitTime;
  }

  // ────────────────────────────────────────────────────────
  // DATA TRACKING
  // ────────────────────────────────────────────────────────

  async addData(
    identifier: string,
    method: string,
    dataSize: number
  ): Promise<void> {
    const netloc = this.resolveNetloc(identifier);
    if (!netloc) {
      return;
    }

    await this.ensureMethodLimits(identifier, netloc, method);

    const existing = await this.repo.getMethodLimits(
      new QueryMethodLimitsParams(identifier, netloc, method)
    );

    let avgData = existing?.avg_data ?? null;
    if (avgData === null) {
      avgData = dataSize;
    } else {
      avgData = (avgData + dataSize) / 2;
    }

    await this.repo.upsertMethodLimits(
      new UpsertMethodLimitsParams(
        identifier,
        netloc,
        method,
        undefined,
        undefined,
        undefined,
        avgData,
        dataSize
      )
    );

    await this.repo.upsertLastMb(
      new UpsertLastMbParams(identifier, netloc, method, dataSize)
    );
  }

  // ────────────────────────────────────────────────────────
  // RESPONSE PROCESSING (NEW - Registry + DB)
  // ────────────────────────────────────────────────────────

  /**
   * Process response and update both registry and database
   * Registry update is FIRST and FAST
   * Database updates are ASYNC and don't block
   */
  private async processResponseAndUpdateRegistry(
    netloc: string,
    method: string,
    response: Response
  ): Promise<void> {
    try {
      // 1. Update in-memory registry FIRST (fast)
      if (response.status === 429) {
        const retryAfter = getRetryAfter(response) || 10;
        this.urlRegistry.markRateLimited(netloc, method, retryAfter);
      } else if (response.status === 200) {
        this.urlRegistry.markSuccess(netloc, method);
      }

      // 2. Process headers and update database (async, doesn't block future requests)
      await this.processHeaders(response, method, netloc);

      // 3. Track data size
      const dataSizeMb = getJsonSizeInMb(response);
      await this.addData(netloc, method, dataSizeMb);
      
      // 4. Add rate event to database
      await this.repo.addRateEvent(
        new AddRateEventParams(netloc, netloc, method, getCurrentTime(), dataSizeMb)
      );

      // 5. Prune old events (async cleanup)
      const pruneThreshold = getCurrentTime() - 30;
      await this.repo.pruneOldEvents(pruneThreshold);

      // 6. Save state
      await this.saveState();
      
    } catch (err) {
      // Log but don't throw - DB errors shouldn't break the response
      console.error({
        logType: 'error',
        function_name: 'RateLimiterService.processResponseAndUpdateRegistry',
        message: 'Failed to process response',
        details: { 
          netloc, 
          method,
          error: err instanceof Error ? err.message : String(err) 
        }
      });
    }
  }

  // ────────────────────────────────────────────────────────
  // RPC CALLS (NEW - Simplified with registry)
  // ────────────────────────────────────────────────────────

  async fetchRpc(options: {
    method: string,
    params?: unknown[],
    id?: string | number,
    jsonrpc?: string | number,
    headers?: Record<string, string>
  }, forceFallback: boolean = false): Promise<any> {
    
    // 1. Get URL from registry (fast, no DB)
    const url = this.getUrl(options.method, forceFallback);
    const netloc = this.resolveNetloc(url);
    
    if (!netloc) {
      throw new Error(`Could not resolve netloc for URL: ${url}`);
    }

    // 2. Set headers
    options.headers = options.headers || { 'Content-Type': 'application/json' };

    // 3. Make request
    let response: Response;
    try {
      response = await fetchRpc(url, options);
    } catch (err) {
      console.log({
        logType: 'error',
        function_name: 'RateLimiterService.fetchRpc',
        message: 'Network error',
        details: { 
          url, 
          method: options.method,
          error: err instanceof Error ? err.message : String(err) 
        }
      });
      
      // Mark URL as problematic in registry
      this.urlRegistry.markRateLimited(netloc, options.method, 30);
      
      // Retry with fallback
      if (!forceFallback) {
        return this.fetchRpc(options, true);
      }
      
      throw err;
    }

    // 4. Process response and update registry + DB
    await this.processResponseAndUpdateRegistry(netloc, options.method, response);

    // 5. Handle 429 with fallback
    if (response.status === 429 && !forceFallback) {
      console.log({
        logType: 'warn',
        function_name: 'RateLimiterService.fetchRpc',
        message: 'Rate limit hit, retrying with fallback',
        details: { url, method: options.method }
      });
      
      return this.fetchRpc(options, true);
    }

    return response;
  }
}

// ============================================================
// FACTORY (Explicit wiring)
// ============================================================

export async function createRateLimiterService(
  config: RateLimiterServiceConfig
): Promise<RateLimiterService> {
  const service = new RateLimiterService(config);
  await service.start();
  return service;
}
