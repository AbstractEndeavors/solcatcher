/**
 * SCHEMAS (Explicit data contracts)
 *
 * All validation happens at construction time.
 * No ad-hoc objects - everything goes through a schema.
 */
// ============================================================
// BASE
// ============================================================
export class LogDataSchema {
    constructor() {
        this.validate();
    }
    toJSON() {
        const plain = {};
        for (const key of Object.keys(this)) {
            plain[key] = this[key];
        }
        return plain;
    }
}
// ============================================================
// ROW (DB OUTPUT)
// ============================================================
export class LogDataRow {
    id;
    signature;
    slot;
    program_id;
    logs_b64;
    parsed_logs;
    pair_id;
    txn_id;
    sorted;
    signatures;
    intake_at;
    created_at;
    updated_at;
    constructor(id, signature, slot, program_id, logs_b64, parsed_logs = null, pair_id = null, txn_id = null, sorted = false, signatures = null, intake_at = new Date(), created_at = new Date(), updated_at = new Date()) {
        this.id = id;
        this.signature = signature;
        this.slot = slot;
        this.program_id = program_id;
        this.logs_b64 = logs_b64;
        this.parsed_logs = parsed_logs;
        this.pair_id = pair_id;
        this.txn_id = txn_id;
        this.sorted = sorted;
        this.signatures = signatures;
        this.intake_at = intake_at;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }
    get isParsed() {
        return this.parsed_logs !== null;
    }
    get isEnriched() {
        return this.slot !== null && this.program_id !== null;
    }
    get isSorted() {
        return this.sorted === true;
    }
    get decodedLogs() {
        return JSON.parse(Buffer.from(this.logs_b64, "base64").toString("utf8"));
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
    signature;
    constructor(signature) {
        super();
        this.signature = signature;
    }
    validate() {
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
    signature;
    slot;
    program_id;
    pair_id;
    txn_id;
    signatures;
    sorted;
    constructor(signature, slot, program_id, pair_id, txn_id, signatures, sorted) {
        super();
        this.signature = signature;
        this.slot = slot;
        this.program_id = program_id;
        this.pair_id = pair_id;
        this.txn_id = txn_id;
        this.signatures = signatures;
        this.sorted = sorted;
    }
    validate() {
        if (!this.signature) {
            throw new Error('UpdateLogEnrichmentParams: signature is required');
        }
    }
    get normalizedSignatures() {
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
    signature;
    slot;
    program_id;
    logs_b64;
    signatures;
    constructor(signature, slot, program_id, logs_b64, signatures = []) {
        super();
        this.signature = signature;
        this.slot = slot;
        this.program_id = program_id;
        this.logs_b64 = logs_b64;
        this.signatures = signatures;
    }
    validate() {
        if (!this.signature)
            throw new Error("signature required");
        if (this.slot === null || this.slot === undefined)
            throw new Error("slot required");
        if (!this.program_id)
            throw new Error("program_id required");
        if (!this.logs_b64)
            throw new Error("logs_b64 required");
    }
    get normalizedSignatures() {
        return Array.isArray(this.signatures)
            ? this.signatures.map(String)
            : [];
    }
}
// ============================================================
// COMMANDS – UPDATE
// ============================================================
export class UpsertParsedLogsParams extends LogDataSchema {
    id;
    parsed_logs;
    constructor(id, parsed_logs) {
        super();
        this.id = id;
        this.parsed_logs = parsed_logs;
    }
    validate() {
        if (!this.id)
            throw new Error('id required');
        if (this.parsed_logs === undefined || this.parsed_logs === null)
            throw new Error('parsed_logs required');
    }
}
// ============================================================
// QUERIES
// ============================================================
export class QueryLogDataByIdParams extends LogDataSchema {
    id;
    constructor(id) {
        super();
        this.id = id;
    }
    validate() {
        if (!this.id || this.id < 1)
            throw new Error('valid id required');
    }
}
export class QueryLogDataBySignatureParams extends LogDataSchema {
    signature;
    constructor(signature) {
        super();
        this.signature = signature;
    }
    validate() {
        if (!this.signature)
            throw new Error('signature required');
    }
}
export class QueryUnsortedParams extends LogDataSchema {
    limit;
    constructor(limit = 100) {
        super();
        this.limit = limit;
    }
    validate() {
        if (this.limit < 1 || this.limit > 1000)
            throw new Error('limit 1–1000');
    }
}
export class MarkLogDataProcessedParams extends LogDataSchema {
    id;
    signature;
    constructor(id, signature) {
        super();
        this.id = id;
        this.signature = signature;
    }
    validate() {
        if (!this.id && !this.signature) {
            throw new Error('MarkProcessedParams: either id or signature is required');
        }
    }
    get isById() {
        return this.id !== undefined;
    }
    get isBySignature() {
        return this.signature !== undefined;
    }
}
export class MarkLogDataProcessedBatchParams extends LogDataSchema {
    ids;
    signatures;
    constructor(ids, signatures) {
        super();
        this.ids = ids;
        this.signatures = signatures;
    }
    validate() {
        if (!this.ids?.length && !this.signatures?.length) {
            throw new Error('MarkProcessedBatchParams: either ids or signatures array is required');
        }
    }
    get isById() {
        return !!this.ids?.length;
    }
    get isBySignature() {
        return !!this.signatures?.length;
    }
}
// ============================================================
// PARSED LOG SCHEMAS
// ============================================================
export class InvocationRecord {
    program_id;
    invocation_index;
    depth;
    logs;
    data;
    children;
    reported_invocation;
    compute;
    constructor(program_id, invocation_index, depth, logs = [], data = [], children = [], reported_invocation, compute) {
        this.program_id = program_id;
        this.invocation_index = invocation_index;
        this.depth = depth;
        this.logs = logs;
        this.data = data;
        this.children = children;
        this.reported_invocation = reported_invocation;
        this.compute = compute;
    }
}
// ============================================================
// COMMANDS – INSERT
// ============================================================
/**
 * Phase 1: intent-only insert
 * Used when chain data is unavailable
 */
export class InsertLogIntentParams extends LogDataSchema {
    signature;
    constructor(signature) {
        super();
        this.signature = signature;
    }
    validate() {
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
    signature;
    slot;
    program_id;
    pair_id;
    txn_id;
    signatures;
    sorted;
    constructor(signature, slot, program_id, pair_id, txn_id, signatures, sorted) {
        super();
        this.signature = signature;
        this.slot = slot;
        this.program_id = program_id;
        this.pair_id = pair_id;
        this.txn_id = txn_id;
        this.signatures = signatures;
        this.sorted = sorted;
    }
    validate() {
        if (!this.signature) {
            throw new Error('UpdateLogEnrichmentParams: signature is required');
        }
    }
    get normalizedSignatures() {
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
    id;
    constructor(id) {
        super();
        this.id = id;
    }
    validate() {
        if (!this.id || this.id < 1)
            throw new Error('valid id required');
    }
}
export class QueryBySignatureParams extends LogDataSchema {
    signature;
    constructor(signature) {
        super();
        this.signature = signature;
    }
    validate() {
        if (!this.signature)
            throw new Error('signature required');
    }
}
export class MarkProcessedParams extends LogDataSchema {
    id;
    signature;
    constructor(id, signature) {
        super();
        this.id = id;
        this.signature = signature;
    }
    validate() {
        if (!this.id && !this.signature) {
            throw new Error('MarkProcessedParams: either id or signature is required');
        }
    }
    get isById() {
        return this.id !== undefined;
    }
    get isBySignature() {
        return this.signature !== undefined;
    }
}
export class MarkProcessedBatchParams extends LogDataSchema {
    ids;
    signatures;
    constructor(ids, signatures) {
        super();
        this.ids = ids;
        this.signatures = signatures;
    }
    validate() {
        if (!this.ids?.length && !this.signatures?.length) {
            throw new Error('MarkProcessedBatchParams: either ids or signatures array is required');
        }
    }
    get isById() {
        return !!this.ids?.length;
    }
    get isBySignature() {
        return !!this.signatures?.length;
    }
}
