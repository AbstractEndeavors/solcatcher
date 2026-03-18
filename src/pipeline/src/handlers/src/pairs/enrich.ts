// src/pipeline/handlers/pairEnrich.ts
import { type AllDeps } from '@repoServices';
import {extractId,expectRepoValue} from '@imports';
import {genesis_queue_lookup} from './../genesis/index.js'
import type { Identity,GenesisEntryPayload}  from '@imports';


export async function pairProvinenceEnrich(payload:Identity,deps:  AllDeps):Promise<null> {
  const result = await deps.pairsRepo.assureIdentityEnrich(payload);
  if (!result.ok) {
    console.warn('pair enrich error', result.reason, result.meta);
    return null
  }
  const {
    id:pair_id,
    needsEnrich,
    enrichType,
    row: pair,
  } = result.value;
  if (!pair?.log_id){
    const signature = pair.signature
    const logResult = await deps.logDataRepo.fetch({signature})
    const logData = expectRepoValue(logResult)
    pair.log_id = extractId(logData)
  }
  if (!pair?.meta_id){
    const mint = pair.mint
    const metaResult = await deps.metaDataRepo.fetch({mint})
    const metaData = expectRepoValue(metaResult)
    pair.log_id = extractId(metaData)
  }
  if (!pair?.txn_id){
    const signature = pair.signature
    const txnResult = await deps.transactionsRepo.fetchBySignature(signature)
    if (txnResult){
      pair.txn_id = extractId(txnResult)
    }
  }
  await deps.pairsRepo.upsert(pair)
  return null
};


export async function pairEnrichment(
  payload: Identity,
  deps: AllDeps
): Promise<null> {
  const mint = payload.mint as string;

  if (mint && deps.cache.isPairComplete(mint)) return null;

  const repoResult = await deps.pairsRepo.assureIdentityEnrich(payload);
  if (!repoResult.ok || !repoResult.value) {
    console.warn('pair enrich error', repoResult.reason, repoResult.meta);
    return null;
  }

  const { id, needsEnrich, enrichType, row: pair } = repoResult.value;

  if (!needsEnrich) {
    if (mint) deps.cache.setPairComplete(mint);
    return null;
  }
  
  if (enrichType.includes('genesis')) {
    await genesis_queue_lookup(pair as GenesisEntryPayload,deps)
    return null;  // genesis blocks all other enrich — don't publish pda/provenance yet
  }
  if (enrichType.includes('pda')) {
    await deps.publisher.publish('genesisEnrich', pair as Identity);
  }
  if (enrichType.includes('provinence')) {
    await deps.publisher.publish('pairProvinenceEnrich', pair as Identity);
  }

  return null;
}

