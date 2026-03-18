/**
 * SIGNATURES SCHEMAS (Explicit data contracts)
 *
 * All validation happens at construction time.
 * No ad-hoc objects - everything goes through a schema.
 */
export declare abstract class SignaturesSchema {
    /** Validate on construction - fail fast */
    constructor();
    protected abstract validate(): void;
    /** Convert to plain object for serialization */
    toJSON(): Record<string, unknown>;
}
export declare class SignaturesRow {
    readonly account: string;
    readonly signatures: any[];
    readonly processed_until: string | null;
    readonly discovery_complete: boolean;
    readonly created_at: Date;
    readonly updated_at: Date;
    constructor(account: string, signatures: any[], // Raw RPC payload
    processed_until: string | null, discovery_complete: boolean, created_at: Date, updated_at: Date);
    get hasSignatures(): boolean;
    get hasProcessedSignatures(): boolean;
    get signatureCount(): number;
    /**
     * Get the latest (most recent) signature
     */
    get latestSignature(): string | null;
    /**
     * Get the oldest signature
     */
    get oldestSignature(): string | null;
}
export declare class UpsertSignaturesParams extends SignaturesSchema {
    readonly account: string;
    readonly signatures: any[];
    constructor(account: string, signatures: any[]);
    protected validate(): void;
    get signatureCount(): number;
}
export declare class UpdateProcessedUntilParams extends SignaturesSchema {
    readonly account: string;
    readonly signature: string;
    constructor(account: string, signature: string);
    protected validate(): void;
}
export declare class QueryByAccountParams extends SignaturesSchema {
    readonly account: string;
    constructor(account: string);
    protected validate(): void;
}
