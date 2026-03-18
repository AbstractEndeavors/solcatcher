import {
  firstNormalizedMint,
  type MintLike,
  type EnrichParams,
  type MetaDataRow,
  type PairRow,
  type IdentityEnrichParams,
  type FetchContext,
  type PairEnrichmentRow,
  type PairIdParams,
  type IdLike,
  type RepoResult,
  expectSingleRow
} from '@imports';
import {SOLANA_PUMP_FUN_PROGRAM_ID} from '@imports';
import { type AllDeps } from '@db';

export async function getOrInsertPairIdentity(
  params: FetchContext,
  deps: AllDeps,
): Promise<RepoResult<IdentityEnrichParams<PairRow>>> {
  return  await deps.pairsRepo.assureIdentityEnrich(params as PairIdParams)
}

export async function getOrInsertMetaIdentity(
  params: FetchContext,
  deps: AllDeps,
): Promise<RepoResult<IdentityEnrichParams<MetaDataRow>>> {
  return  await deps.metaDataRepo.assureIdentityEnrich(params as PairIdParams)
}


export async function getPayload(
  payload:  EnrichParams | null  = null,
  deps: AllDeps
): Promise< EnrichParams | null > {
  if (!payload) return null;
  let mint = firstNormalizedMint(payload);
  mint = firstNormalizedMint(payload.pair);
  payload.program_id = payload.program_id as string || SOLANA_PUMP_FUN_PROGRAM_ID as string
  let identity:IdentityEnrichParams<PairRow | MetaDataRow>
  if (!mint){
    identity = await deps.pairsRepo.assureIdentityEnrich(payload);
    payload.pair = identity.row as PairRow
    payload.pair.program_id = payload.pair.program_id || payload.program_id
  }
  mint = firstNormalizedMint(payload.meta);
  if (!mint){
    identity = await deps.metaDataRepo.assureIdentityEnrich(payload);
    payload.meta = identity.row as MetaDataRow
    payload.meta.program_id = payload.meta.program_id || payload.program_id
  }
  payload.mint = firstNormalizedMint(payload.meta);
  return payload
}

export async function getMint(
  payload: EnrichParams | null = null,
  deps: AllDeps
): Promise<MintLike | null> {
  if (!payload) return null;

  // Probe all known mint-bearing fields before touching the DB
  const mint = firstNormalizedMint(
    payload,        // payload.mint, payload.mintAddress etc.
    payload.meta,   // meta.mint
    payload.pair,   // pair.mint
  );
  if (mint) return mint;

  // Only hit DB if all local candidates exhausted
  payload = await getPayload(payload,deps);
  if (!payload) return null;
  return firstNormalizedMint(
    payload,        // payload.mint, payload.mintAddress etc.
    payload.meta,   // meta.mint
    payload.pair,   // pair.mint
  );
}
export async function isSigEnrich(
  payload: EnrichParams | null = null,
  deps: AllDeps
): Promise<boolean> {
  if (!payload) return false;
  let identity:IdentityEnrichParams<PairRow | MetaDataRow>
  identity = await deps.pairsRepo.assureIdentityEnrich(payload);
  if (identity.needsEnrich && identity.enrichType.includes('genesis')){
    return true
  }
  identity = await deps.metaDataRepo.assureIdentityEnrich(payload);
  if (identity.needsEnrich && identity.enrichType.includes('genesis')){
    return true
  }
  return false
 
}
