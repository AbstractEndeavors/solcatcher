import type {DataLike,IdLike,IntLike,BoolLike,AddressLike,MintLike,SigLike} from './imports.js';
export interface DecodedEntry {
  type: string;
  data: DataLike;
}

export interface RawDecodedEntry {
  name: string;
  category: string;
  data: Record<string, unknown>;
}


export interface DecodedObject {
  amount?: IntLike;
  maxSolCost?: IntLike;
  minSolOutput?: IntLike;
  mint?: MintLike;
  solAmount?: IntLike;
  tokenAmount?: IntLike;
  isBuy?: BoolLike;
  user?: AddressLike;
  timestamp?: DecodedEntry;
  virtualSolReserves?: IntLike;
  virtualTokenReserves?: IntLike;
}

export interface LogEntry {
  id: IdLike;
  type: string;
  rawData: string;
  decoded: DecodedObject[];
}

export interface DecodedProgramData {
  discriminator: string;
  raw: Buffer;
  fields: Record<string, any>;
}

export type DecodeContext =
  | "instruction"
  | "trade"
  | "event";

export interface DecodeInput {
  programId: string;
  data: string;        // base64
  context: DecodeContext;
}

export interface DecodeResult {
  programId: AddressLike;
  discriminator?: string;
  type: string;
  data: Record<string, any>;
}

// =============================================================================
// LAYER 1 → LAYER 2: Extract Decoded
// =============================================================================

export interface RawDecodeOutput {
  name: string;
  category: string;
  data: Record<string, unknown>;
}

export interface FetchContext { 
    mint?:MintLike,
    signature?:SigLike,
    id?:IdLike;
    limit?:IntLike;
    latest?:BoolLike,
    program_id?:AddressLike
}
export interface PairIdParams{
    mint:MintLike;
    program_id:AddressLike;
}
export interface MetaIdParams{
    mint:MintLike;
}
export interface CtxBuild{
    mint?:MintLike;
    slot?:IntLike;
    signature?:SigLike;
    program_id?:AddressLike, 
    log_id?:IdLike;
    pair_id?:IdLike;
    invocation?:IntLike;
    meta_id?:IdLike;
    txn_id?:IdLike;
    payload_count?: IntLike;
}

export interface RawDecodedEntry {
  name: string;
  category: string;
  data: Record<string, unknown>;
}



