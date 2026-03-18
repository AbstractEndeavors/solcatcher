import type {SigLike,IntLike,AddressLike,IdLike,BoolLike,DateLike,DataLike,Base64String} from './imports.js'
export interface LogMessage {
  signature: SigLike;
  signatures: SigLike[];
  slot: IntLike;
  logs: string[];
  program_id?: AddressLike;
}
export interface LogIntakeQueueMessage {
  program_id: string;
  signature: string;
  slot: number;
  logs_b64: Base64String | string;
}
/**
 * Interface for LogData.
 */
export interface LogData extends LogMessage{
  id?: IdLike;
  logs_b64?: DataLike[];
  parsed_logs?: DataLike[];
  pair_id?: IdLike;
  txn_id?: IdLike;
  sorted?: BoolLike;
  intake_at?:DataLike;
  created_at?: DateLike;
  updated_at?: DateLike;
}


export interface ProgramLogEvent {
  program_id: string;
  signature: string;
  slot: number;
  logs_b64: string;
}