import  {
  type PairEnrichmentRow,
  type EnrichParams,
  type IdentityEnrichParams,
  type PairRow,
  type RepoResult
} from '@imports';
import type { AllDeps } from '@db';
export async function getPairRow(
  params: EnrichParams,
  deps: AllDeps
):  Promise<RepoResult<IdentityEnrichParams<PairRow>>>{
  return deps.pairsRepo.assureIdentityEnrich(params);
}
