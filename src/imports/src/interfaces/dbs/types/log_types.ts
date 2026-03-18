import type {AddressLike,IntLike} from '@imports'
export interface InvocationRecords {
  program_id: AddressLike;
  invocationNumber: IntLike;
  logs: string[];
  data: string[];
}
export interface ParsedLogs {
  invocations: InvocationRecord[];
}
export interface InvocationRecord {
  program_id: AddressLike;

  // stable + deterministic
  invocation_index: IntLike;
  depth: IntLike;

  // optional Solana info (debug only)
  reported_invocation?: IntLike;

  logs: string[];
  data: string[];

  compute?: {
    consumed: IntLike;
    limit: IntLike;
  };

  children: InvocationRecord[];
}