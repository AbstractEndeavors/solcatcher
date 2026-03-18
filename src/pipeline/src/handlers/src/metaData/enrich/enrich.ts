import {
  firstNormalizedMint,
  firstNormalizedUri,
  upsertOnchainMetaData,
  getMetaId,
  fetchOnchainMetaData,
  fetchOffchainJson,
  upsertOffchainMetaData,
  type MetaDataEnrichParams,
  type StringLike,
  type AllDeps,
} from './imports.js';
import {deriveAllPDAsAuto,type DerivedPDAsResult} from '@rateLimiter';
import {type MetaDataRow,type MetadataUpsertInput,type Identity, expectRepoValue,minutesSince} from '@imports';
import {genesis_queue_lookup} from './../../genesis/index.js'
export async function getUri(
  payload: MetaDataEnrichParams,
  deps: AllDeps
): Promise<StringLike> {
  if (!payload) return null;
  return firstNormalizedUri(payload)
  //const uri = firstNormalizedUri(payload)
  //if (uri) return uri;
  //payload = await onchainEnrich(payload,deps);
  //return firstNormalizedUri(payload);
}
export async function meta_data_queue_lookup(payload: Identity, deps: AllDeps): Promise<void> {
  const claimed = await deps.metaDataRepo.tryClaimSlot(payload.id);
  if (!claimed) return; // already being processed (or recently claimed)
  
  try {
    await deps.publisher.publish('onChainMetaDataEnrich', payload);
  } catch (err) {
    // publish failed — release so it can be retried
    await deps.metaDataRepo.releaseSlot(payload.id);
    throw err;
  }
}

/* -------------------------------------------------- */
/* Orchestrate                                        */
/* -------------------------------------------------- */
export async function offChainEnrich(
  payload: MetaDataEnrichParams,
  deps: AllDeps
): Promise<MetaDataEnrichParams> {
  const metaDataRepo = deps.metaDataRepo;
  const repoResult = await metaDataRepo.assureIdentityEnrich(payload);
  if (!repoResult.ok || !repoResult.value) {
    console.warn('pair enrich error', repoResult.reason, repoResult.meta);
    return payload
  }
  const {
    id:meta_id,
    needsEnrich,
    enrichType,
    row,
  } = repoResult.value;
  let uri = payload.uri || row.uri
  // Spread into plain object — never pass raw DB row downstream
  payload = {
    ...payload,
    mint:    payload.mint    || firstNormalizedMint(row),
    meta_id: meta_id || payload.meta_id || await getMetaId(row as MetaDataRow,deps),
    uri:     payload.uri     || firstNormalizedUri(row),
  };

  // If still no uri, fetch onchain to get it
  /*if (!payload.uri) {
    payload = await onchainEnrich(payload, deps);
    payload = { ...payload, uri: firstNormalizedUri(payload) };
  }*/

  if (needsEnrich && enrichType.includes('offchain') && uri) {
    const chainData = await fetchOffchainJson(payload.uri);
    if (chainData) {
      await upsertOffchainMetaData(chainData, payload, deps);
    }
  }
  return payload;
}

/* -------------------------------------------------- */
/* Orchestrate                                        */
/* -------------------------------------------------- */
export async function onchainEnrich(
  payload: MetaDataEnrichParams,
  deps: AllDeps
): Promise<MetaDataEnrichParams> {
  const metaDataRepo = deps.metaDataRepo;
  const repoResult = await metaDataRepo.assureIdentityEnrich(payload);
  if (!repoResult.ok || !repoResult.value) {
    console.warn('pair enrich error', repoResult.reason, repoResult.meta);
    return payload
  }
  const {
    id:meta_id,
    needsEnrich,
    enrichType,
    row,
  } = repoResult.value;
  payload = {
    ...payload,
    mint:    payload.mint    || firstNormalizedMint(row),
    meta_id: payload.meta_id || meta_id,
  };

  if (needsEnrich && enrichType.includes('onchain') && minutesSince(row.claimed_at as Date) > 5) {
    const chainData = await fetchOnchainMetaData(payload,deps);
   
    if (chainData) {
      await upsertOnchainMetaData(chainData, payload, deps);
    }
  }

  return payload;
}

export async function signatureMetaEnrich(
  payload: MetaDataEnrichParams,
  deps: AllDeps
): Promise<MetaDataEnrichParams> {
  const metaDataRepo = deps.metaDataRepo;
  const repoResult = await metaDataRepo.assureIdentityEnrich(payload);
  if (!repoResult.ok || !repoResult.value) {
    console.warn('pair enrich error', repoResult.reason, repoResult.meta);
    return payload
  }
  const {
    id:meta_id,
    needsEnrich,
    enrichType,
    row,
  } = repoResult.value;
  payload = {
    ...payload,
    mint:    payload.mint    || firstNormalizedMint(row),
    meta_id: payload.meta_id || meta_id,
  };

  if (needsEnrich && enrichType.includes('genesis')) {
    await onchainEnrich(payload,deps);

  }

  return payload;
}

export async function genesisEnrichPdas(
    payload: Identity,
    deps:AllDeps
):Promise<DerivedPDAsResult>{
  const mint = payload.mint
  const pairRepo = await deps.pairsRepo.fetch({mint});
  let pair = expectRepoValue(pairRepo)
  const metaRepo = await deps.metaDataRepo.fetch({mint});
  let meta = expectRepoValue(metaRepo)
  const d = deriveAllPDAsAuto(payload);
  meta.metadata_pda = d.metaplex
  pair.metaplex = d.metaplex
  meta.bonding_curve = d.bonding_curve
  meta.token_standard = d.token_program
  pair.bonding_curve = d.bonding_curve
  meta.associated_bonding_curve = d.associated_bonding_curve
  pair.associated_bonding_curve = d.associated_bonding_curve
  await deps.pairsRepo.upsert(pair);  // <-- was insert
  await deps.metaDataRepo.upsertGenesis(meta as MetadataUpsertInput);  // <-- was insert
  return d
}
export async function metaDataEnrichment(
  payload: Identity,
  deps: AllDeps
): Promise<null> {
  const mint = payload.mint as string;

  if (mint && deps.cache.isMetaComplete(mint)) return null;

  const repoResult = await deps.metaDataRepo.assureIdentityEnrich(payload);
  if (!repoResult.ok || !repoResult.value) {
    console.warn('meta enrich error', repoResult.reason, repoResult.meta);
    return null;
  }

  const { needsEnrich, enrichType, row: meta } = repoResult.value;
  if (!needsEnrich) {
    if (mint) deps.cache.setMetaComplete(mint);
    return null;
  }

  if (enrichType.includes('genesis')) {
    const pairResult = await deps.pairsRepo.fetch({ mint });
    const pair = expectRepoValue(pairResult);
    await genesis_queue_lookup(pair,deps)
    return null;  // genesis blocks everything else
  }
  if (enrichType.includes('pda')) {
    await deps.publisher.publish('genesisEnrich', meta as Identity);
  }
  if (enrichType.includes('onchain')) {
    await meta_data_queue_lookup(meta,deps)
  }
  if (enrichType.includes('offchain')) {
    await deps.publisher.publish('offChainMetaDataEnrich', meta as Identity);
    
  }

  return null;
}
