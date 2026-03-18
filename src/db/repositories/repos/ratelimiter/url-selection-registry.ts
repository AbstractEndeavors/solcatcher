/**
 * URL SELECTION REGISTRY
 * 
 * Single source of truth for URL health and selection.
 * NO database queries - pure in-memory state machine.
 * 
 * Pattern: Registry over globals, explicit state over inference
 */

import { type UrlDict,urlToString } from '@imports';
import { getCurrentTime } from './utils.js';

// ============================================================
// SCHEMAS (Explicit contracts)
// ============================================================

export class UrlHealthSnapshot {
  constructor(
    public readonly urls: Array<{
      netloc: string;
      url: string;
      status: 'available' | 'cooldown' | 'circuit_breaker';
      cooldowns: Record<string, number>;
      successCount: number;
    }>,
    public readonly timestamp: number
  ) {}
}

export class UrlSelectionConfig {
  constructor(
    public readonly urls: UrlDict[],
    public readonly fallbackUrl: UrlDict,
    public readonly circuitBreakerThreshold: number = 3,
    public readonly circuitBreakerDuration: number = 60
  ) {}
}

// ============================================================
// URL HEALTH STATE (Per-URL state machine)
// ============================================================

class UrlHealthState {
  readonly url: UrlDict;
  readonly netloc: string;
  private readonly methodCooldowns: Map<string, number>; // method -> cooldown_until_timestamp
  private readonly methodFailures: Map<string, number>; // method -> consecutive_failure_count
  private circuitBreakerUntil: number = 0;

  constructor(url: UrlDict) {
    this.url = url;
    this.netloc = url.netloc;
    this.methodCooldowns = new Map();
    this.methodFailures = new Map();
  }

  isAvailable(now: number, method: string): boolean {
    // Check circuit breaker (global block)
    if (this.circuitBreakerUntil > now) {
      return false;
    }
    
    // Check method-specific cooldown
    const cooldown = this.methodCooldowns.get(method);
    if (cooldown && cooldown > now) {
      return false;
    }
    
    return true;
  }

  enterCooldown(method: string, durationSeconds: number, circuitBreakerThreshold: number): void {
    const now = getCurrentTime();
    const until = now + durationSeconds;
    
    // Set method cooldown
    this.methodCooldowns.set(method, until);
    
    // Track consecutive failures
    const failures = (this.methodFailures.get(method) || 0) + 1;
    this.methodFailures.set(method, failures);
    
    // Trip circuit breaker if too many failures
    if (failures >= circuitBreakerThreshold) {
      this.circuitBreakerUntil = until + 60; // Extra penalty
      console.log({
        logType: 'warn',
        function_name: 'UrlHealthState.enterCooldown',
        message: 'Circuit breaker triggered',
        details: {
          netloc: this.netloc,
          method,
          failures,
          cooldownUntil: new Date(until * 1000).toISOString(),
          circuitBreakerUntil: new Date(this.circuitBreakerUntil * 1000).toISOString(),
        }
      });
    }
  }

  recordSuccess(method: string): void {
    // Clear cooldown
    this.methodCooldowns.delete(method);
    
    // Reset failure counter
    this.methodFailures.set(method, 0);
    
    // Reset circuit breaker if all cooldowns are clear
    const now = getCurrentTime();
    const hasActiveCooldowns = Array.from(this.methodCooldowns.values()).some(until => until > now);
    if (!hasActiveCooldowns) {
      this.circuitBreakerUntil = 0;
    }
  }

  getStatus(now: number): 'available' | 'cooldown' | 'circuit_breaker' {
    if (this.circuitBreakerUntil > now) {
      return 'circuit_breaker';
    }
    
    // Check if any method is in cooldown
    for (const [_, until] of this.methodCooldowns) {
      if (until > now) {
        return 'cooldown';
      }
    }
    
    return 'available';
  }

  getActiveCooldowns(now: number): Record<string, number> {
    const active: Record<string, number> = {};
    
    for (const [method, until] of this.methodCooldowns) {
      if (until > now) {
        active[method] = until - now;
      }
    }
    
    return active;
  }

  getSuccessCount(): number {
    // Count methods with 0 failures
    let successCount = 0;
    for (const [_, failures] of this.methodFailures) {
      if (failures === 0) successCount++;
    }
    return successCount;
  }

  // Cleanup expired cooldowns (for memory management)
  cleanup(now: number): void {
    for (const [method, until] of this.methodCooldowns) {
      if (until <= now) {
        this.methodCooldowns.delete(method);
      }
    }
  }
}

// ============================================================
// URL SELECTION REGISTRY (Single source of truth)
// ============================================================

export class UrlSelectionRegistry {
  private readonly config: UrlSelectionConfig;
  private readonly urlStates: Map<string, UrlHealthState>;
  private readonly fallbackNetloc: string;
  private currentIndex: number = 0;

  constructor(config: UrlSelectionConfig) {
    this.config = config;
    this.urlStates = new Map();
    this.fallbackNetloc = config.fallbackUrl.netloc;
    
    // Initialize health states for all URLs
    for (const url of config.urls) {
      this.urlStates.set(url.netloc, new UrlHealthState(url));
    }
    
    // Also track fallback
    this.urlStates.set(config.fallbackUrl.netloc, new UrlHealthState(config.fallbackUrl));
  }

  /**
   * Get next available URL
   * FAST, SYNCHRONOUS, NO DATABASE
   * Returns fallback if all URLs are in cooldown
   */
  getNextAvailable(method: string): string {
    const now = getCurrentTime();
    
    // Cleanup expired cooldowns periodically
    if (this.currentIndex % 10 === 0) {
      for (const state of this.urlStates.values()) {
        state.cleanup(now);
      }
    }
    
    // Get available URLs (excluding fallback)
    const available = Array.from(this.urlStates.values())
      .filter(state => 
        state.netloc !== this.fallbackNetloc && 
        state.isAvailable(now, method)
      );
    
    // If no URLs available, return fallback
    if (available.length === 0) {
      console.log({
        logType: 'warn',
        function_name: 'UrlSelectionRegistry.getNextAvailable',
        message: 'All URLs in cooldown, using fallback',
        details: { method }
      });
      return urlToString(this.config.fallbackUrl);
    }
    
    // Round-robin selection among available URLs
    const selected = available[this.currentIndex % available.length];
    this.currentIndex++;
    
    return urlToString(selected.url);
  }

  /**
   * Get fallback URL directly
   */
  getFallback(): string {
    return urlToString(this.config.fallbackUrl);
  }

  /**
   * Mark URL as rate-limited (circuit breaker pattern)
   * Call when you get 429 or detect rate limit
   */
  markRateLimited(netloc: string, method: string, cooldownSeconds: number): void {
    const state = this.urlStates.get(netloc);
    if (!state) {
      console.log({
        logType: 'warn',
        function_name: 'UrlSelectionRegistry.markRateLimited',
        message: 'Unknown netloc',
        details: { netloc }
      });
      return;
    }
    
    state.enterCooldown(
      method, 
      cooldownSeconds, 
      this.config.circuitBreakerThreshold
    );
    
    console.log({
      logType: 'info',
      function_name: 'UrlSelectionRegistry.markRateLimited',
      message: 'URL marked as rate-limited',
      details: {
        netloc,
        method,
        cooldownSeconds,
      }
    });
  }

  /**
   * Report successful request
   */
  markSuccess(netloc: string, method: string): void {
    const state = this.urlStates.get(netloc);
    if (!state) return;
    
    state.recordSuccess(method);
  }

  /**
   * Get current health status (for monitoring/debugging)
   */
  getHealthSnapshot(): UrlHealthSnapshot {
    const now = getCurrentTime();
    const urls: UrlHealthSnapshot['urls'] = [];
    
    for (const [netloc, state] of this.urlStates) {
      urls.push({
        netloc,
        url: urlToString(state.url),
        status: state.getStatus(now),
        cooldowns: state.getActiveCooldowns(now),
        successCount: state.getSuccessCount(),
      });
    }
    
    return new UrlHealthSnapshot(urls, now);
  }

  /**
   * Resolve netloc from URL string or identifier
   */
  resolveNetloc(identifier: string): string | null {
    // Check if it's already a netloc we know
    if (this.urlStates.has(identifier)) {
      return identifier;
    }
    
    // Try to extract netloc from URL string
    try {
      const url = new URL(identifier);
      return url.hostname;
    } catch {
      return null;
    }
  }
}

// ============================================================
// FACTORY (Explicit wiring)
// ============================================================

export function createUrlSelectionRegistry(
  config: UrlSelectionConfig
): UrlSelectionRegistry {
  return new UrlSelectionRegistry(config);
}
