import type { IdLike, MintLike, AddressLike, SigLike } from './imports.ts';
import type { EnrichmentContext, PartitionedEvents } from '@imports';
export interface IdentityParams {
    mint?: MintLike;
    program_id?: AddressLike;
}
export interface IdentityEnrichParams<T = unknown> {
    id: IdLike;
    needsEnrich: boolean;
    enrichType: Array<string>;
    row: T | null;
}
export interface Identity extends IdentityParams {
    id?: IdLike;
    signature?: SigLike;
}
export interface EnrichmentContextWithEvents extends EnrichmentContext {
    decoded_events?: PartitionedEvents;
}
