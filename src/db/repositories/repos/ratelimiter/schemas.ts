/**
 * RATE LIMITER SCHEMAS (Explicit data contracts)
 * 
 * All validation happens at construction time.
 * No ad-hoc objects - everything goes through a schema.
 */

// ============================================================
// SCHEMA BASE
// ============================================================


import type { UrlDict,MethodLike,IdLike } from "@imports";
abstract class Schema {
  protected constructor() {
    // ❌ DO NOT validate here
  }

  protected abstract validate(): void;

  /** Explicit validation hook */
  protected _validate(): void {
    this.validate();
  }

  /** Convert to plain object for serialization */
  toJSON(): Record<string, unknown> {
    const plain: Record<string, unknown> = {};
    for (const key of Object.keys(this)) {
      plain[key] = (this as any)[key];
    }
    return plain;
  }
}
// ============================================================
// ROW SCHEMAS (Database outputs)
// ============================================================

export class RateEventRow {
  constructor(
    public readonly id: number,
    public readonly netloc: string,
    public readonly method: string,
    public readonly time: number,
    public readonly data: number
  ) {}
}

export class CooldownRow {
  constructor(
    public readonly netloc: string,
    public readonly method: string,
    public readonly until: number
  ) {}

  get isExpired(): boolean {
    return this.until <= Date.now() / 1000;
  }

  get remainingSeconds(): number {
    const remaining = this.until - Date.now() / 1000;
    return Math.max(0, remaining);
  }
}

export class MethodLimitsRow {
  constructor(
    public readonly netloc: string,
    public readonly method: string,
    public readonly rate_limit: number | null,
    public readonly rps_limit: number | null,
    public readonly retry_after: number | null,
    public readonly avg_data: number | null,
    public readonly last_data: number | null
  ) {}

  get hasRateLimit(): boolean {
    return this.rate_limit !== null;
  }

  get hasRpsLimit(): boolean {
    return this.rps_limit !== null;
  }

  get hasRetryAfter(): boolean {
    return this.retry_after !== null;
  }
}

export class UrlRegistryRow {
  constructor(
    public readonly identifier: string,
    public readonly netloc: string,
    public readonly scheme: string,
    public readonly name: string,
    public readonly ext: string
  ) {}

  get fullUrl(): string {
    return `${this.scheme}://${this.netloc}`;
  }
}

export class UrlVariantRow {
  constructor(
    public readonly identifier: string,
    public readonly variant: string
  ) {}
}

export class StateRow {
  constructor(
    public readonly key: string,
    public readonly value: string,
    public readonly updated_at: number
  ) {}
}

export class LastMbRow {
  constructor(
    public readonly identifier: string,
    public readonly netloc: string,
    public readonly method: string,
    public readonly last_mb: number,
    public readonly updated_at: number
  ) {}
}

// ============================================================
// COMMAND SCHEMAS (Database inputs)
// ============================================================

export class AddRateEventParams extends Schema {
  constructor(
    public readonly identifier: string,
    public readonly netloc: string,
    public readonly method: string,
    public readonly time: number,
    public readonly data: number = 0
  ) {
    super();
  }

  protected validate(): void {
    if (!this.netloc) {
      throw new Error('AddRateEventParams: netloc is required');
    }
    if (!this.method) {
      throw new Error('AddRateEventParams: method is required');
    }
    if (this.time <= 0) {
      throw new Error('AddRateEventParams: time must be positive');
    }
    if (this.data < 0) {
      throw new Error('AddRateEventParams: data cannot be negative');
    }
  }
}

export class SetCooldownParams extends Schema {
  constructor(
    public readonly netloc: string,
    public readonly method: string,
    public readonly until: number
  ) {
    super();
  }

  protected validate(): void {
    if (!this.netloc) {
      throw new Error('SetCooldownParams: netloc is required');
    }
    if (!this.method) {
      throw new Error('SetCooldownParams: method is required');
    }
    if (this.until <= 0) {
      throw new Error('SetCooldownParams: until must be positive');
    }
  }
}

export class UpsertMethodLimitsParams extends Schema {
  constructor(
    public readonly identifier: string,
    public readonly netloc: string,
    public readonly method: string,
    public readonly rate_limit?: number | null,
    public readonly rps_limit?: number | null,
    public readonly retry_after?: number | null,
    public readonly avg_data?: number | null,
    public readonly last_data?: number | null
  ) {
    super();
  }

  protected validate(): void {
    if (!this.netloc) {
      throw new Error('UpsertMethodLimitsParams: netloc is required');
    }
    if (!this.method) {
      throw new Error('UpsertMethodLimitsParams: method is required');
    }
  }
}

export class UpsertUrlRegistryParams extends Schema {
  constructor(
    public readonly identifier: string,
    public readonly netloc: string,
    public readonly scheme: string,
    public readonly name: string,
    public readonly ext: string
  ) {
    super();
  }

  protected validate(): void {
    if (!this.identifier) {
      throw new Error('UpsertUrlRegistryParams: identifier is required');
    }
    if (!this.netloc) {
      throw new Error('UpsertUrlRegistryParams: netloc is required');
    }
    if (!this.scheme) {
      throw new Error('UpsertUrlRegistryParams: scheme is required');
    }
  }
}

export class AddUrlVariantParams extends Schema {
  constructor(
    public readonly identifier: string,
    public readonly variant: string
  ) {
    super();
  }

  protected validate(): void {
    if (!this.identifier) {
      throw new Error('AddUrlVariantParams: identifier is required');
    }
    if (!this.variant) {
      throw new Error('AddUrlVariantParams: variant is required');
    }
  }
}

export class UpsertStateParams extends Schema {
  constructor(
    public readonly key: string,
    public readonly value: string
  ) {
    super();
  }

  protected validate(): void {
    if (!this.key) {
      throw new Error('UpsertStateParams: key is required');
    }
    if (this.value === undefined || this.value === null) {
      throw new Error('UpsertStateParams: value is required');
    }
  }
}

export class UpsertLastMbParams extends Schema {
  constructor(
    public readonly identifier: string,
    public readonly netloc: string,
    public readonly method: string,
    public readonly last_mb: number
  ) {
    super();
  }

  protected validate(): void {
    if (!this.netloc) {
      throw new Error('UpsertLastMbParams: netloc is required');
    }
    if (!this.method) {
      throw new Error('UpsertLastMbParams: method is required');
    }
    if (this.last_mb < 0) {
      throw new Error('UpsertLastMbParams: last_mb cannot be negative');
    }
  }
}

// ============================================================
// QUERY SCHEMAS (Request parameters)
// ============================================================

export class QueryRecentEventsParams extends Schema {
  constructor(
    public readonly identifier: string,
    public readonly netloc: string,
    public readonly method: string,
    public readonly since: number
  ) {
    super();
  }

  protected validate(): void {
    if (!this.netloc) {
      throw new Error('QueryRecentEventsParams: netloc is required');
    }
    if (!this.method) {
      throw new Error('QueryRecentEventsParams: method is required');
    }
    if (this.since <= 0) {
      throw new Error('QueryRecentEventsParams: since must be positive');
    }
  }
}

export class QueryCooldownParams extends Schema {
  constructor(
    public readonly identifier: string,
    public readonly netloc: string,
    public readonly method: string
  ) {
    super();
  }

  protected validate(): void {
    if (!this.netloc) {
      throw new Error('QueryCooldownParams: netloc is required');
    }
    if (!this.method) {
      throw new Error('QueryCooldownParams: method is required');
    }
  }
}

export class QueryMethodLimitsParams extends Schema {
  constructor(
    public readonly identifier: string,
    public readonly netloc: string,
    public readonly method: string
  ) {
    super();
  }

  protected validate(): void {
    if (!this.netloc) {
      throw new Error('QueryMethodLimitsParams: netloc is required');
    }
    if (!this.method) {
      throw new Error('QueryMethodLimitsParams: method is required');
    }
  }
}

export class QueryUrlByIdentifierParams extends Schema {
  constructor(public readonly identifier: string) {
    super();
  }

  protected validate(): void {
    if (!this.identifier) {
      throw new Error('QueryUrlByIdentifierParams: identifier is required');
    }
  }
}

export class QueryVariantsByIdentifierParams extends Schema {
  constructor(public readonly identifier: string) {
    super();
  }

  protected validate(): void {
    if (!this.identifier) {
      throw new Error('QueryVariantsByIdentifierParams: identifier is required');
    }
  }
}

export class QueryIdentifierByVariantParams extends Schema {
  constructor(public readonly variant: string) {
    super();
  }

  protected validate(): void {
    if (!this.variant) {
      throw new Error('QueryIdentifierByVariantParams: variant is required');
    }
  }
}

export class QueryStateValueParams extends Schema {
  constructor(public readonly key: string) {
    super();
  }

  protected validate(): void {
    if (!this.key) {
      throw new Error('QueryStateValueParams: key is required');
    }
  }
}

export class QueryLastMbParams extends Schema {
  constructor(
    public readonly identifier: string,
    public readonly netloc: string,
    public readonly method: string
  ) {
    super();
  }

  protected validate(): void {
    if (!this.netloc) {
      throw new Error('QueryLastMbParams: netloc is required');
    }
    if (!this.method) {
      throw new Error('QueryLastMbParams: method is required');
    }
  }
}

export class QueryLastMbForNetlocParams extends Schema {
  constructor(public readonly netloc: string) {
    super();
  }

  protected validate(): void {
    if (!this.netloc) {
      throw new Error('QueryLastMbForNetlocParams: netloc is required');
    }
  }
}

// ============================================================
// VALUE OBJECTS (Domain logic)
// ============================================================

export class RpcPayload {
  constructor(
    public readonly jsonrpc: string,
    public readonly id: number,
    public readonly method: string,
    public readonly params: unknown[]
  ) {}

  toString(): string {
    return JSON.stringify({
      jsonrpc: this.jsonrpc,
      id: this.id,
      method: this.method,
      params: this.params,
    });
  }
}

export class DefaultLimits {
  constructor(
    public readonly rate_limit: number = 40,
    public readonly rps_limit: number = 100,
    public readonly retry_after: number = 10
  ) {}
}
