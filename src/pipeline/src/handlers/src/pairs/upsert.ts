// src/pipeline/handlers/pairEnrich.ts
import { type AllDeps } from '@repoServices';
import type { Identity,InsertPairParams}  from '@imports';
export async function pairGenesisInsert(  
  payload: InsertPairParams,
  deps: AllDeps
):Promise<Identity> {
  await deps.signaturesService.markGenesisSignatureComplete({
      account:payload.mint,
      signature:payload.signature
    });
  const row = await deps.pairsRepo.upsert(payload);

  return payload as Identity
}
