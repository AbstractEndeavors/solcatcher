import  {
  type Identity,
  type IdentityEnrichParams,
  type MetaDataRow,
  type RepoResult
} from '@imports';
import type { AllDeps } from '@db';
// ============================================================
// META RESOLUTION — find or create the meta row
// ============================================================
export async function resolveMetaRow(
  params: Identity,
  deps: AllDeps
): Promise<RepoResult<IdentityEnrichParams<MetaDataRow>>>{
  return deps.metaDataRepo.assureIdentityEnrich(params)
}

export async function refreshMetaRow(
  ctx: Identity,
  repos: AllDeps
): Promise<RepoResult<IdentityEnrichParams<MetaDataRow>>> {
  return resolveMetaRow(ctx,repos);
}
