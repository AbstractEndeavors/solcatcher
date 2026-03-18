import {
  type IdLike,
  firstNormalizedId,
  type EnrichParams,
  type MetaDataRow,
  type IdentityEnrichParams,
  type RepoResult
} from '@imports';
import { type AllDeps} from '@db';
import {resolveMetaRow} from './resolve.js';
/* -------------------------------------------------- */
/* Helpers                                            */
/* -------------------------------------------------- */
export async function getMetaId(
  payload: EnrichParams,
  deps: AllDeps
): Promise<IdLike | null> {
  if (!payload) return null;

  const meta_id = firstNormalizedId(
    payload,        // payload.meta_id, payload.id
    payload.meta,   // meta.id
  );
  if (meta_id) return meta_id;
  const identity = await resolveMetaRow(payload,deps);
  return firstNormalizedId(identity);
}

export async function getMetaRow(
  params: EnrichParams,
  deps: AllDeps
):  Promise<RepoResult<IdentityEnrichParams<MetaDataRow>>>{
  return deps.metaDataRepo.assureIdentityEnrich(params);
}
