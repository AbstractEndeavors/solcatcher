import type { SigLike } from '@Pipeline/src/queues/definitions.js';
import { type AllDeps } from '@repoServices';
import { type EnrichParams, type AddressLike, type MintLike } from '@imports';
export declare function discoverSignatures(mint: MintLike, program_id: AddressLike, deps: AllDeps): Promise<SigLike | null>;
export declare function genesisEnrich(payload: EnrichParams, publish: boolean | undefined, deps: AllDeps): Promise<EnrichParams | null>;
