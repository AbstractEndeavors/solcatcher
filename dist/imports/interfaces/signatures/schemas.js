/**
 * SIGNATURES SCHEMAS (Explicit data contracts)
 *
 * All validation happens at construction time.
 * No ad-hoc objects - everything goes through a schema.
 */
// ============================================================
// SCHEMA BASE
// ============================================================
export class SignaturesSchema {
    /** Validate on construction - fail fast */
    constructor() {
        this.validate();
    }
    /** Convert to plain object for serialization */
    toJSON() {
        const plain = {};
        for (const key of Object.keys(this)) {
            plain[key] = this[key];
        }
        return plain;
    }
}
// ============================================================
// ROW SCHEMAS (Database outputs)
// ============================================================
export class SignaturesRow {
    account;
    signatures;
    processed_until;
    discovery_complete;
    created_at;
    updated_at;
    constructor(account, signatures, // Raw RPC payload
    processed_until, discovery_complete, created_at, updated_at) {
        this.account = account;
        this.signatures = signatures;
        this.processed_until = processed_until;
        this.discovery_complete = discovery_complete;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }
    get hasSignatures() {
        return this.signatures.length > 0;
    }
    get hasProcessedSignatures() {
        return this.processed_until !== null;
    }
    get signatureCount() {
        return this.signatures.length;
    }
    /**
     * Get the latest (most recent) signature
     */
    get latestSignature() {
        if (this.signatures.length === 0)
            return null;
        return this.signatures[0]?.signature ?? null;
    }
    /**
     * Get the oldest signature
     */
    get oldestSignature() {
        if (this.signatures.length === 0)
            return null;
        return this.signatures[this.signatures.length - 1]?.signature ?? null;
    }
}
// ============================================================
// COMMAND SCHEMAS (Database inputs)
// ============================================================
export class UpsertSignaturesParams extends SignaturesSchema {
    account;
    signatures;
    constructor(account, signatures) {
        super();
        this.account = account;
        this.signatures = signatures;
    }
    validate() {
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
    get signatureCount() {
        return this.signatures.length;
    }
}
export class UpdateProcessedUntilParams extends SignaturesSchema {
    account;
    signature;
    constructor(account, signature) {
        super();
        this.account = account;
        this.signature = signature;
    }
    validate() {
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
    account;
    constructor(account) {
        super();
        this.account = account;
    }
    validate() {
        if (!this.account) {
            throw new Error('QueryByAccountParams: account is required');
        }
        // Account must be valid base58 address (32-44 chars)
        if (this.account.length < 32 || this.account.length > 44) {
            throw new Error('UpsertSignaturesParams: account must be a valid address');
        }
    }
}
