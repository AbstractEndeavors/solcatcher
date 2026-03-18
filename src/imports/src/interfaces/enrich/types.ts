import type {IdLike,MintLike,AddressLike,SigLike} from './imports.ts';
import type {EnrichmentContext,PartitionedEvents} from '@imports'

// interfaces/enrich/index.ts

export interface IdentityParams {
  mint?: MintLike;
  program_id?: AddressLike;
}

export interface IdentityEnrichParams<T> {
  id: IdLike;
  needsEnrich: boolean;
  enrichType: string[];
  row: T;           // not nullable — if you have an IdentityEnrichParams, you have a row
}

export interface Identity extends IdentityParams {
  id?: IdLike;
  signature?: SigLike;
}

export interface EnrichmentContextWithEvents extends EnrichmentContext {
  decoded_events?: PartitionedEvents;
}
