// src/pipeline/handlers/genesisLookup.ts
import {
   deriveAllPDAsAuto,
   type DerivedPDAsResult
   } from '@rateLimiter';
import type {
  AllDeps
} from '@repoServices';
import type {
  EnrichParams,
  AddressLike,
  MintLike,
  SigLike,
  RepoResult,
  LogDataRow,
  DiscoverIncremental,
  Identity,
  GenesisEntryPayload
} from '@imports';
import {
  SOLANA_PUMP_FUN_PROGRAM_ID,
  getPubkeyString

} from '@imports'; 
import {fetchOrCreateTxnRepoResult} from './../pipelines/index.js';

export async function genesis_queue_lookup(payload: GenesisEntryPayload, deps: AllDeps): Promise<void> {
  const claimed = await deps.pairsRepo.tryClaimSlot(payload.id);
  if (!claimed) return; // already being processed (or recently claimed)
  
  try {
    await deps.publisher.publish('genesisLookup', payload);
  } catch (err) {
    // publish failed — release so it can be retried
    await deps.pairsRepo.releaseSlot(payload.id);
    throw err;
  }
}
export function getOrDerivePDAs(mint: MintLike, deps: AllDeps): DerivedPDAsResult {
  const cached = deps.cache.getPdas(mint);
  if (cached) return cached;
  const pdas = deriveAllPDAsAuto({ mint });
  deps.cache.setPdas(mint, pdas);
  return pdas;
}

export async function discoverSignatures(
  payload: Identity,
  deps: AllDeps
): Promise<SigLike | null> {
  // Check memory before doing any network/DB work
  const cached = deps.cache.getSignature(payload.mint);
  if (cached) return cached;

  const pdas = getOrDerivePDAs(payload.mint, deps);
  const accounts: AddressLike[] = [
    payload.mint,
    pdas.metaplex,
    pdas.bonding_curve,
    pdas.associated_bonding_curve,
  ].filter(Boolean).map(getPubkeyString);

  for (const account of accounts) {
    let complete = false;
    let until: SigLike = null;
    let attempts = 0;

    while (!complete && attempts++ < 10) {
      const result: DiscoverIncremental =
        await deps.signaturesService.discoverSignaturesIncremental({ account, until });
      complete = result.complete;
      until = result.until;
    }

    if (until) {
      deps.cache.setSignature(payload.mint, until);
      return until;
    }
  }

  return null;
}

export async function genesisLookup(
  payload: EnrichParams,
  deps: AllDeps,
  publish: boolean = true
): Promise<RepoResult<LogDataRow>> {
  payload.program_id ??= SOLANA_PUMP_FUN_PROGRAM_ID;
  try {
    const signature = await discoverSignatures(payload, deps);
    
    if (!signature) {
      return { ok: false, reason: 'no_signature_found', meta: { mint: payload.mint } };
    }

    payload.signature = signature;
    
    const repoResult = await fetchOrCreateTxnRepoResult(payload, deps);
    if (!repoResult.ok) return repoResult;

    if (publish) {
      await deps.publisher.publish('logEntry', repoResult);
    }

    return repoResult;
  } catch (err) {
    return {
      ok: false,
      reason: 'genesis_enrich_failed',
      meta: { mint: payload.mint, err: String(err) }
    };
  }
}