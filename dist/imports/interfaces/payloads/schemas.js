/**
 * LOG PAYLOADS LogPayloadSchemaS
 *
 * All validation happens at construction time.
 * No ad-hoc objects - everything goes through a LogPayloadSchema.
 */
class LogPayloadSchema {
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
// ROW LogPayloadSchema (Database output)
// ============================================================
export class LogPayloadRow {
    id;
    signature;
    program_id;
    discriminator;
    payload_len;
    event;
    depth;
    invocation_index;
    reported_invocation;
    parent_program_id;
    parent_event;
    b64;
    decodable;
    decoded_data;
    processed;
    failed;
    created_at;
    processed_at;
    constructor(id, signature, program_id, discriminator, payload_len, event, depth, invocation_index, reported_invocation, parent_program_id, parent_event, b64, decodable, decoded_data = null, processed = false, failed = null, created_at = null, processed_at = null) {
        this.id = id;
        this.signature = signature;
        this.program_id = program_id;
        this.discriminator = discriminator;
        this.payload_len = payload_len;
        this.event = event;
        this.depth = depth;
        this.invocation_index = invocation_index;
        this.reported_invocation = reported_invocation;
        this.parent_program_id = parent_program_id;
        this.parent_event = parent_event;
        this.b64 = b64;
        this.decodable = decodable;
        this.decoded_data = decoded_data;
        this.processed = processed;
        this.failed = failed;
        this.created_at = created_at;
        this.processed_at = processed_at;
    }
    get isProcessed() {
        return this.processed;
    }
    get hasFailed() {
        return this.failed === true;
    }
    get hasParent() {
        return this.parent_program_id !== null;
    }
    get isDecoded() {
        return this.decoded_data !== null;
    }
}
// ============================================================
// INSERT LogPayloadSchemaS (Database inputs)
// ============================================================
export class InsertLogPayloadParams extends LogPayloadSchema {
    signature;
    program_id;
    discriminator;
    payload_len;
    event;
    depth;
    invocation_index;
    reported_invocation;
    parent_program_id;
    parent_event;
    b64;
    decodable;
    constructor(signature, program_id, discriminator, payload_len, event, depth, invocation_index, reported_invocation, parent_program_id, parent_event, b64, decodable) {
        super();
        this.signature = signature;
        this.program_id = program_id;
        this.discriminator = discriminator;
        this.payload_len = payload_len;
        this.event = event;
        this.depth = depth;
        this.invocation_index = invocation_index;
        this.reported_invocation = reported_invocation;
        this.parent_program_id = parent_program_id;
        this.parent_event = parent_event;
        this.b64 = b64;
        this.decodable = decodable;
    }
    validate() {
        const ctx = 'InsertLogPayloadParams';
        if (!this.signature || typeof this.signature !== 'string') {
            throw new Error(`${ctx}: signature is required`);
        }
        if (!this.program_id || typeof this.program_id !== 'string') {
            throw new Error(`${ctx}: program_id is required`);
        }
        if (!this.discriminator || typeof this.discriminator !== 'string') {
            throw new Error(`${ctx}: discriminator is required`);
        }
        if (typeof this.payload_len !== 'number' || this.payload_len < 0) {
            throw new Error(`${ctx}: payload_len must be a non-negative number`);
        }
        if (typeof this.depth !== 'number' || this.depth < 0) {
            throw new Error(`${ctx}: depth must be a non-negative number`);
        }
        if (typeof this.invocation_index !== 'number') {
            throw new Error(`${ctx}: invocation_index is required`);
        }
        if (!this.b64 || typeof this.b64 !== 'string') {
            throw new Error(`${ctx}: b64 is required`);
        }
    }
}
export class InsertUnknownInstructionParams extends LogPayloadSchema {
    signature;
    program_id;
    invocation_index;
    discriminator;
    data_prefix;
    reason;
    constructor(signature, program_id, invocation_index, discriminator, data_prefix, reason) {
        super();
        this.signature = signature;
        this.program_id = program_id;
        this.invocation_index = invocation_index;
        this.discriminator = discriminator;
        this.data_prefix = data_prefix;
        this.reason = reason;
    }
    validate() {
        const ctx = 'InsertUnknownInstructionParams';
        if (!this.signature) {
            throw new Error(`${ctx}: signature is required`);
        }
        if (!this.program_id) {
            throw new Error(`${ctx}: program_id is required`);
        }
        if (typeof this.invocation_index !== 'number') {
            throw new Error(`${ctx}: invocation_index is required`);
        }
        if (!this.discriminator) {
            throw new Error(`${ctx}: discriminator is required`);
        }
        if (!this.reason) {
            throw new Error(`${ctx}: reason is required`);
        }
    }
}
// ============================================================
// QUERY LogPayloadSchemaS
// ============================================================
export class QueryLogPayloadByIdParams extends LogPayloadSchema {
    id;
    constructor(id) {
        super();
        this.id = id;
    }
    validate() {
        if (!this.id || this.id < 1) {
            throw new Error('QueryByIdParams: id must be a positive number');
        }
    }
}
export class QueryLogPayloadBySignatureParams extends LogPayloadSchema {
    signature;
    constructor(signature) {
        super();
        this.signature = signature;
    }
    validate() {
        if (!this.signature) {
            throw new Error('QueryBySignatureParams: signature is required');
        }
    }
}
export class QueryLogPayloadByDiscriminatorParams extends LogPayloadSchema {
    discriminator;
    constructor(discriminator) {
        super();
        this.discriminator = discriminator;
    }
    validate() {
        if (!this.discriminator) {
            throw new Error('QueryByDiscriminatorParams: discriminator is required');
        }
    }
}
/**
 * Convert validated params to batch item
 */
export function toBatchItem(params) {
    return {
        signature: params.signature,
        program_id: params.program_id,
        discriminator: params.discriminator,
        payload_len: params.payload_len,
        event: params.event,
        depth: params.depth,
        invocation_index: params.invocation_index,
        reported_invocation: params.reported_invocation,
        parent_program_id: params.parent_program_id,
        parent_event: params.parent_event,
        b64: params.b64,
        decodable: params.decodable
    };
}
// Schema for log payload insert
export class LogPayloadInsert {
    signature;
    program_id;
    discriminator;
    payload_len;
    event;
    depth;
    invocation_index;
    reported_invocation;
    parent_program_id;
    parent_event;
    b64;
    decodable;
    constructor(signature, program_id, discriminator, payload_len, event, depth, invocation_index, reported_invocation, parent_program_id, parent_event, b64, decodable) {
        this.signature = signature;
        this.program_id = program_id;
        this.discriminator = discriminator;
        this.payload_len = payload_len;
        this.event = event;
        this.depth = depth;
        this.invocation_index = invocation_index;
        this.reported_invocation = reported_invocation;
        this.parent_program_id = parent_program_id;
        this.parent_event = parent_event;
        this.b64 = b64;
        this.decodable = decodable;
    }
    // Convert to plain object for JSON insertion
    toJSON() {
        return {
            signature: this.signature,
            program_id: this.program_id,
            discriminator: this.discriminator,
            payload_len: this.payload_len,
            event: this.event,
            depth: this.depth,
            invocation_index: this.invocation_index,
            reported_invocation: this.reported_invocation,
            parent_program_id: this.parent_program_id,
            parent_event: this.parent_event,
            b64: this.b64,
            decodable: this.decodable,
        };
    }
}
// Schema for decoded program data with payload
export class ProgramDataEntry {
    raw;
    decoded;
    payload;
    discriminator;
    constructor(raw, // Base64 string
    decoded, // Decoded bytes
    payload, // Parsed payload from registry
    discriminator // Extracted discriminator
    ) {
        this.raw = raw;
        this.decoded = decoded;
        this.payload = payload;
        this.discriminator = discriminator;
    }
}
