import {
  type IdLike,
  type OnchainMetadataPayload,
  type MetaDataEnrichParams,
  type EnrichedCreateMetaDataInsert,
  type Identity,
  firstNormalizedUri
} from '@imports';
import { type AllDeps} from '@repoServices';
import {buildEnrichOnchainParams} from './build.js';
import {fetchOffchainJson} from './fetch.js'
import {getMetaId } from './get.js';
/* -------------------------------------------------- */
/* Upsert                                             */
/* -------------------------------------------------- */
export async function upsertOnchainMetaData(
  chainData: OnchainMetadataPayload,
  payload:   MetaDataEnrichParams,
  deps:      AllDeps
): Promise<IdLike | null> {
  const meta_id = await getMetaId(payload, deps);
  if (!meta_id || !chainData) return null;
  try {
    return await deps.metaDataRepo.enrichOnchain(meta_id, buildEnrichOnchainParams(chainData));
  } catch (err) {
    console.error({
      logType: 'error',
      message:  'onchainEnrich: upsert failed',
      details:  { meta_id, error: String(err) },
    });
    return null;
  }
}

/* -------------------------------------------------- */
/* Upsert                                             */
/* -------------------------------------------------- */

export async function upsertOffchainMetaData(
  chainData: OnchainMetadataPayload,
  payload:   MetaDataEnrichParams,
  deps:      AllDeps
): Promise<IdLike | null> {
  const meta_id = await getMetaId(payload, deps);
  if (!meta_id || !chainData) return null;
  try {
  const uri = await firstNormalizedUri(payload)
  const offchain = await fetchOffchainJson(uri);
  if (offchain){
    await deps.metaDataRepo.enrichOffchain(meta_id,offchain);
  }
  } catch (err) {
    console.error({
      logType: 'error',
      message:  'OffchainEnrich: upsert failed',
      details:  { meta_id, error: String(err) },
    });
    return null;
  }
}


export async function metaDataGenesisInsert(  
  payload: EnrichedCreateMetaDataInsert,
  deps: AllDeps
):Promise<Identity> {
  await deps.metaDataRepo.insertGenesis(payload);
  return payload as Identity
}