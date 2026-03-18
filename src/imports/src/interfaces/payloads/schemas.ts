/**
 * LOG PAYLOADS LogPayloadSchemaS
 * 
 * All validation happens at construction time.
 * No ad-hoc objects - everything goes through a LogPayloadSchema.
 */

// ============================================================
// LogPayloadSchema BASE
// ============================================================
import type {IdLike,SigLike,AddressLike,IntLike,DateLike} from './../imports.js';


abstract class LogPayloadSchema {
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
// ROW LogPayloadSchema (Database output)
// ============================================================

export class LogPayloadRow {
  constructor(
    public readonly id: IdLike,
    public readonly signature: SigLike,
    public readonly program_id: AddressLike,
    public readonly discriminator: string,
    public readonly payload_len: number,
    public readonly event: string | null,
    public readonly depth: IntLike,
    public readonly invocation_index: IntLike,
    public readonly reported_invocation: IntLike,
    public readonly parent_program_id: AddressLike,
    public readonly parent_event: string | null,
    public readonly b64: string,
    public readonly decodable: boolean,
    public readonly decoded_data: Record<string, unknown> | null = null,
    public readonly processed: boolean = false,
    public readonly failed: boolean | null = null,
    public readonly created_at: DateLike = null,
    public readonly processed_at: DateLike = null
  ) {}

  get isProcessed(): boolean {
    return this.processed;
  }

  get hasFailed(): boolean {
    return this.failed === true;
  }

  get hasParent(): boolean {
    return this.parent_program_id !== null;
  }

  get isDecoded(): boolean {
    return this.decoded_data !== null;
  }
}

// ============================================================
// INSERT LogPayloadSchemaS (Database inputs)
// ============================================================

export class InsertLogPayloadParams extends LogPayloadSchema {
  constructor(
    public readonly signature: SigLike,
    public readonly program_id: AddressLike,
    public readonly discriminator: string,
    public readonly payload_len: number,
    public readonly event: string | null,
    public readonly depth: IntLike,
    public readonly invocation_index: IntLike,
    public readonly reported_invocation: IntLike,
    public readonly parent_program_id: AddressLike,
    public readonly parent_event: string | null,
    public readonly b64: string,
    public readonly decodable: boolean,
  ) {
    super();
  }

  protected validate(): void {
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
  constructor(
    public readonly signature: SigLike,
    public readonly program_id: AddressLike,
    public readonly invocation_index: IntLike,
    public readonly discriminator: string,
    public readonly data_prefix: string,
    public readonly reason: string
  ) {
    super();
  }

  protected validate(): void {
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
  constructor(public readonly id: IdLike) {
    super();
  }

  protected validate(): void {
    if (!this.id || this.id as number < 1) {
      throw new Error('QueryByIdParams: id must be a positive number');
    }
  }
}

export class QueryLogPayloadBySignatureParams extends LogPayloadSchema {
  constructor(public readonly signature: SigLike) {
    super();
  }

  protected validate(): void {
    if (!this.signature) {
      throw new Error('QueryBySignatureParams: signature is required');
    }
  }
}

export class QueryLogPayloadByDiscriminatorParams extends LogPayloadSchema {
  constructor(public readonly discriminator: string) {
    super();
  }

  protected validate(): void {
    if (!this.discriminator) {
      throw new Error('QueryByDiscriminatorParams: discriminator is required');
    }
  }
}

// ============================================================
// BATCH INSERT (for JSON serialization)
// ============================================================

/**
 * Lightweight interface for batch insert JSON serialization.
 * Use InsertLogPayloadParams for single validated inserts.
 */
export interface LogPayloadBatchItem {
  signature: SigLike;
  program_id: AddressLike;
  discriminator: string;
  payload_len: number;
  event: string | null | undefined;
  depth: IntLike;
  invocation_index: IntLike;
  reported_invocation: IntLike;
  parent_program_id: AddressLike;
  parent_event: string | null;
  b64: string;
  decodable: boolean;
}

/**
 * Convert validated params to batch item
 */
export function toBatchItem(params: InsertLogPayloadParams): LogPayloadBatchItem {
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
export type LogPayloadRows = LogPayloadRow[]
export type LogPayloadRowLike = LogPayloadRow | null
export type LogPayloadRowsLike = LogPayloadRows | null
export type LogPayloadLike = LogPayloadRow | LogPayloadRows | null

// Schema for log payload insert
export class LogPayloadInsert {
    constructor(
        public readonly signature: string,
        public readonly program_id: string,
        public readonly discriminator: string,
        public readonly payload_len: number,
        public readonly event: string | null,
        public readonly depth: number,
        public readonly invocation_index: number,
        public readonly reported_invocation: number | null,
        public readonly parent_program_id: string | null,
        public readonly parent_event: string | null,
        public readonly b64: string,
        public readonly decodable: boolean
    ) {}

    // Convert to plain object for JSON insertion
    toJSON(): Record<string, any> {
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
    constructor(
        public readonly raw: string,           // Base64 string
        public readonly decoded: Buffer,       // Decoded bytes
        public readonly payload: any,          // Parsed payload from registry
        public readonly discriminator: string  // Extracted discriminator
    ) {}
}



