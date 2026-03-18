/**
 * SCHEMAS (Explicit data contracts)
 * 
 * All validation happens at construction time.
 * No ad-hoc objects - everything goes through a schema.
 */


// ============================================================
// SCHEMA BASE
// ============================================================

/**
 * SCHEMAS (Explicit data contracts)
 * Two-phase lifecycle:
 *   1. Intent (identity-only)
 *   2. Enriched (chain-complete)
 */

import type { IdLike, SigLike,LimitLike,DataLike,IntLike,AddressLike } from './imports.js';

// ============================================================
// BASE
// ============================================================

export abstract class LogDataSchema {
  constructor() {
    this.validate();
  }
  protected abstract validate(): void;
  toJSON(): Record<string, unknown> {
  const plain: Record<string, unknown> = {};
  for (const key of Object.keys(this)) {
    plain[key] = (this as any)[key];
  }
  return plain;
}
}

// ============================================================
// ROW (DB OUTPUT)
// ============================================================

export class LogDataRow {
  constructor(
    public readonly id: number,
    public readonly signature: string,
    public readonly slot: number | null,
    public readonly program_id: string | null,
    public readonly logs_b64: DataLike,
    public readonly parsed_logs: unknown | null = null,
    public readonly pair_id: number | null = null,
    public readonly txn_id: number | null = null,
    public readonly sorted: boolean = false,
    public readonly signatures: string[] | null = null,
    public readonly intake_at: Date = new Date(),
    public readonly created_at: Date = new Date(),
    public readonly updated_at: Date = new Date()
  ) {}

  get isParsed(): boolean {
    return this.parsed_logs !== null;
  }

  get isEnriched(): boolean {
    return this.slot !== null && this.program_id !== null;
  }

  get isSorted(): boolean {
    return this.sorted === true;
  }
  get decodedLogs(): DataLike[] {
  return JSON.parse(
    Buffer.from(this.logs_b64, "base64").toString("utf8")
  );
}

}

// ============================================================
// COMMANDS – INSERT
// ============================================================

/**
 * Phase 1: intent-only insert
 * Used when chain data is unavailable
 */
export class InsertLogDataIntentParams extends LogDataSchema {
  constructor(public readonly signature: string) {
    super();
  }

  protected validate(): void {
    if (!this.signature) {
      throw new Error('InsertLogIntentParams: signature is required');
    }
  }
}
/**
 * Phase 2: Enrichment update
 * Attaches discovered facts to an existing log row
 */
export class UpdateLogDataEnrichmentParams extends LogDataSchema {
  constructor(
    public readonly signature: string,
    public readonly slot?: number | null,
    public readonly program_id?: string | null,
    public readonly pair_id?: number | null,
    public readonly txn_id?: number | null,
    public readonly signatures?: string[] | null,
    public readonly sorted?: boolean
  ) {
    super();
  }

  protected validate(): void {
    if (!this.signature) {
      throw new Error('UpdateLogEnrichmentParams: signature is required');
    }
  }

  get normalizedSignatures(): string[] | null {
    if (!Array.isArray(this.signatures) || this.signatures.length === 0) {
      return null;
    }
    return this.signatures.map(String);
  }
}

/**
 * Phase 2: chain-complete insert
 */
export class InsertLogDataParams extends LogDataSchema {
  constructor(
    public readonly signature: string,
    public readonly slot: number,
    public readonly program_id: string,
    public readonly logs_b64: string,
    public readonly signatures: string[] = []
  ) {
    super();
  }

  protected validate(): void {
    if (!this.signature) throw new Error("signature required");
    if (this.slot === null || this.slot === undefined)
      throw new Error("slot required");
    if (!this.program_id) throw new Error("program_id required");
    if (!this.logs_b64) throw new Error("logs_b64 required");
  }

  get normalizedSignatures(): string[] {
    return Array.isArray(this.signatures)
      ? this.signatures.map(String)
      : [];
  }
}

// ============================================================
// COMMANDS – UPDATE
// ============================================================

export class UpsertParsedLogsParams extends LogDataSchema {
  constructor(
    public readonly id: IdLike,
    public readonly parsed_logs: DataLike
  ) {
    super();
  }

  protected validate(): void {
    if (!this.id) throw new Error('id required');
    if (this.parsed_logs === undefined || this.parsed_logs === null)
      throw new Error('parsed_logs required');
  }
}

// ============================================================
// QUERIES
// ============================================================

export class QueryLogDataByIdParams extends LogDataSchema {
  constructor(public readonly id: IdLike) {
    super();
  }
  protected validate(): void {
    if (!this.id || this.id as number < 1) throw new Error('valid id required');
  }
}

export class QueryLogDataBySignatureParams extends LogDataSchema {
  constructor(public readonly signature: SigLike) {
    super();
  }
  protected validate(): void {
    if (!this.signature) throw new Error('signature required');
  }
}

export class QueryUnsortedParams extends LogDataSchema {
  constructor(public readonly limit: LimitLike = 100) {
    super();
  }
  protected validate(): void {
    if (this.limit as number < 1 || this.limit as number > 1000)
      throw new Error('limit 1–1000');
  }
}


export class MarkLogDataProcessedParams extends LogDataSchema {
  constructor(
    public readonly id?: IdLike,
    public readonly signature?: SigLike
  ) {
    super();
  }

  protected validate(): void {
    if (!this.id && !this.signature) {
      throw new Error('MarkProcessedParams: either id or signature is required');
    }
  }

  get isById(): boolean {
    return this.id !== undefined;
  }

  get isBySignature(): boolean {
    return this.signature !== undefined;
  }
}

export class MarkLogDataProcessedBatchParams extends LogDataSchema {
  constructor(
    public readonly ids?: IdLike[],
    public readonly signatures?: SigLike[]
  ) {
    super();
  }

  protected validate(): void {
    if (!this.ids?.length && !this.signatures?.length) {
      throw new Error('MarkProcessedBatchParams: either ids or signatures array is required');
    }
  }

  get isById(): boolean {
    return !!this.ids?.length;
  }

  get isBySignature(): boolean {
    return !!this.signatures?.length;
  }
}

// ============================================================
// PARSED LOG SCHEMAS
// ============================================================

export class InvocationRecord {
  constructor(
    public readonly program_id: AddressLike,
    public readonly invocation_index: IntLike,
    public readonly depth: IntLike,
    public readonly logs: DataLike[] = [],
    public readonly data: DataLike[] = [],
    public readonly children: IntLike[] = [],
    public readonly reported_invocation?: IntLike,
    public readonly compute?: { consumed: IntLike; limit: LimitLike }
  ) {}
}



// ============================================================
// COMMANDS – INSERT
// ============================================================

/**
 * Phase 1: intent-only insert
 * Used when chain data is unavailable
 */
export class InsertLogIntentParams extends LogDataSchema {
  constructor(public readonly signature: string) {
    super();
  }

  protected validate(): void {
    if (!this.signature) {
      throw new Error('InsertLogIntentParams: signature is required');
    }
  }
}
/**
 * Phase 2: Enrichment update
 * Attaches discovered facts to an existing log row
 */
export class UpdateLogEnrichmentParams extends LogDataSchema {
  constructor(
    public readonly signature: string,
    public readonly slot?: number | null,
    public readonly program_id?: string | null,
    public readonly pair_id?: number | null,
    public readonly txn_id?: number | null,
    public readonly signatures?: string[] | null,
    public readonly sorted?: boolean
  ) {
    super();
  }

  protected validate(): void {
    if (!this.signature) {
      throw new Error('UpdateLogEnrichmentParams: signature is required');
    }
  }

  get normalizedSignatures(): string[] | null {
    if (!Array.isArray(this.signatures) || this.signatures.length === 0) {
      return null;
    }
    return this.signatures.map(String);
  }
}




// ============================================================
// QUERIES
// ============================================================

export class QueryByIdParams extends LogDataSchema {
  constructor(public readonly id: IdLike) {
    super();
  }
  protected validate(): void {
    if (!this.id || this.id as number < 1) throw new Error('valid id required');
  }
}

export class QueryBySignatureParams extends LogDataSchema {
  constructor(public readonly signature: SigLike) {
    super();
  }
  protected validate(): void {
    if (!this.signature) throw new Error('signature required');
  }
}

export class MarkProcessedParams extends LogDataSchema {
  constructor(
    public readonly id?: IdLike,
    public readonly signature?: SigLike
  ) {
    super();
  }

  protected validate(): void {
    if (!this.id && !this.signature) {
      throw new Error('MarkProcessedParams: either id or signature is required');
    }
  }

  get isById(): boolean {
    return this.id !== undefined;
  }

  get isBySignature(): boolean {
    return this.signature !== undefined;
  }
}

export class MarkProcessedBatchParams extends LogDataSchema {
  constructor(
    public readonly ids?: IdLike[],
    public readonly signatures?: SigLike[]
  ) {
    super();
  }

  protected validate(): void {
    if (!this.ids?.length && !this.signatures?.length) {
      throw new Error('MarkProcessedBatchParams: either ids or signatures array is required');
    }
  }

  get isById(): boolean {
    return !!this.ids?.length;
  }

  get isBySignature(): boolean {
    return !!this.signatures?.length;
  }
}
export interface MutableInvocation {
  program_id: string;
  invocation_index: number;
  depth: number;
  reported_invocation?: number;
  logs: string[];
  data: string[];
  children: MutableInvocation[];
  compute?: { consumed: number; limit: number };
}

export type RepoResult<T> =
  | { ok: true;  value: T;    reason?: never; meta?: Record<string, unknown> }
  | { ok: false; value?: never; reason: string; meta?: Record<string, unknown> };