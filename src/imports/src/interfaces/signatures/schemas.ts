/**
 * SIGNATURES SCHEMAS (Explicit data contracts)
 * 
 * All validation happens at construction time.
 * No ad-hoc objects - everything goes through a schema.
 */

// ============================================================
// SCHEMA BASE
// ============================================================

export abstract class SignaturesSchema {
  /** Validate on construction - fail fast */
  constructor() {
    this.validate();
  }

  protected abstract validate(): void;

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

export class SignaturesRow {
  constructor(
    public readonly account: string,
    public readonly signatures: any[], // Raw RPC payload
    public readonly processed_until: string | null,
    public readonly discovery_complete: boolean,
    public readonly created_at: Date,
    public readonly updated_at: Date
  ) {}

  get hasSignatures(): boolean {
    return this.signatures.length > 0;
  }

  get hasProcessedSignatures(): boolean {
    return this.processed_until !== null;
  }

  get signatureCount(): number {
    return this.signatures.length;
  }

  /**
   * Get the latest (most recent) signature
   */
  get latestSignature(): string | null {
    if (this.signatures.length === 0) return null;
    return this.signatures[0]?.signature ?? null;
  }

  /**
   * Get the oldest signature
   */
  get oldestSignature(): string | null {
    if (this.signatures.length === 0) return null;
    return this.signatures[this.signatures.length - 1]?.signature ?? null;
  }
}

// ============================================================
// COMMAND SCHEMAS (Database inputs)
// ============================================================

export class UpsertSignaturesParams extends SignaturesSchema {
  constructor(
    public readonly account: string,
    public readonly signatures: any[]
  ) {
    super();
  }

  protected validate(): void {
    if (!this.account) {
      throw new Error('UpsertSignaturesParams: account is required');
    }

    // Account must be valid base58 address (32-44 chars)
    if (this.account.length < 32 || this.account.length > 44) {
      throw new Error('UpsertSignaturesParams: account must be a valid address');
    }

    if (!Array.isArray(this.signatures)) {
      throw new Error('UpsertSignaturesParams: signatures must be an array');
    }
  }

  get signatureCount(): number {
    return this.signatures.length;
  }
}

export class UpdateProcessedUntilParams extends SignaturesSchema {
  constructor(
    public readonly account: string,
    public readonly signature: string
  ) {
    super();
  }

  protected validate(): void {
    if (!this.account) {
      throw new Error('UpdateProcessedUntilParams: account is required');
    }

    if (!this.signature) {
      throw new Error('UpdateProcessedUntilParams: processed_until is required');
    }

    // Signature validation (80-90 chars for Solana signatures)
    if (this.signature.length < 80 || this.signature.length > 90) {
      throw new Error('UpdateProcessedUntilParams: processed_until must be a valid signature');
    }
  }
}

// ============================================================
// QUERY SCHEMAS (Request parameters)
// ============================================================

export class QueryByAccountParams extends SignaturesSchema {
  constructor(public readonly account: string) {
    super();
  }

  protected validate(): void {
    if (!this.account) {
      throw new Error('QueryByAccountParams: account is required');
    }
        // Account must be valid base58 address (32-44 chars)
    if (this.account.length < 32 || this.account.length > 44) {
      throw new Error('UpsertSignaturesParams: account must be a valid address');
    }
  }
}
