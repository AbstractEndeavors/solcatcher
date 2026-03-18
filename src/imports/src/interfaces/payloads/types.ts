import type {
  MintLike,
  DataLike,
  AddressLike,
  IntLike,
  SigLike,
  IdLike,
  TradePipelineResult,
  CreatePipelineResult,
  DecodedTradeEvent,
  DecodedCreateEvent,
  LimitLike,
  BoolLike
} from './imports.js';
// =============================================================================
// LAYER 3: PERSISTED (DB-ready, all strings/primitives)
// =============================================================================
export interface ParsedLogNode {
  program_id: AddressLike;
  logs?: DataLike[];
  data?: DataLike[];
  depth: IntLike;
  invocation_index: IntLike;
  parent_invocation?: IntLike;
}
export interface ProcessedLogIntakeResult {
    log_id: IdLike;
    signature:SigLike,
    payload_count: IntLike;
  }
export interface CTX {
                signature:SigLike;
                slot: IntLike;
                program_id:AddressLike;
                log_id: IdLike;
                mint?:MintLike;
                invocation?: IntLike;
                txn_id?: IdLike;
                meta_id?: IdLike;
                pair_id?: IdLike;
            }
export interface ProcessLogResult {
  trades: Array<{decoded:TradePipelineResult | DecodedTradeEvent,ctx:CTX}>;
  creates: Array<{decoded:CreatePipelineResult | DecodedCreateEvent,ctx:CTX}>;
  unknowns: Array<{decoded:DataLike,ctx:CTX}>;
  errors: Array<{decoded:DataLike,ctx:CTX}>;
}

export interface LogPayloadOptions {
    id?: IdLike;
    signature?: SigLike;
    program_id?:AddressLike,
    slot?:IntLike,
    logData?: DataLike;
    limit?:LimitLike;
    latest?:BoolLike
  }
export interface LogPayloadContext {
    log_id?: IdLike;
    id?: IdLike;
    signature?:SigLike,
    program_id?:AddressLike;
    slot?:IntLike;
    payload_count?: number;
    payload?: Record<string, unknown>;
  }
export interface PayloadContext {
    log_id?: IdLike;
    id?: IdLike;
    signature?:SigLike,
    program_id?:AddressLike;
    slot?:IntLike;
    payload_count: number;
    payload: Record<string, unknown>;
  }
export type BatchPayloadInsertSummary = {
  signature: string;
  program_id: AddressLike;
  ids: number[];
  count: number;
};
