import { LogPayloadRepository } from './imports.js';
import type { BatchPayloadInsertSummary, InsertUnknownInstructionParams, LogPayloadBatchItem } from './imports.js';
export declare function insertBatch(this: LogPayloadRepository, rows: LogPayloadBatchItem[]): Promise<BatchPayloadInsertSummary[]>;
/**
 * Insert a single unknown instruction record.
 */
export declare function insertUnknownInstruction(this: LogPayloadRepository, params: InsertUnknownInstructionParams): Promise<void>;
