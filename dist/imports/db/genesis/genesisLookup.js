// src/pipeline/handlers/genesisLookup.ts
import { getMint, isSigEnrich } from '../utils/get.js';
import { deriveAllPDAsAuto } from '@rateLimiter';
import { getDeps } from '@repoServices';
import { SOLANA_PUMP_FUN_PROGRAM_ID } from '@imports';
import { fetchOrCreateTxnRepoResult } from './genesisInsertPipeline.js';
/* -------------------------------------------------- */
/* Orchestrate                                        */
/* -------------------------------------------------- */
import { getPubkeyString } from '@imports';
export async function discoverSignatures(mint, program_id, deps) {
    const pdas = deriveAllPDAsAuto(mint, program_id);
    // Normalize to strings at the boundary — everything downstream expects string pubkeys
    const accounts = [
        mint,
        pdas.metaplex,
        pdas.bonding_curve,
        pdas.associated_bonding_curve,
    ]
        .filter(Boolean)
        .map(getPubkeyString); // ← the missing step
    for (const account of accounts) {
        let complete = false;
        let until = null;
        let attempts = 0;
        while (!complete && attempts++ < 10) {
            const result = await deps.signaturesService.discoverSignaturesIncremental({ account, until });
            complete = result.complete;
            until = result.until;
            console.log({ account, attempt: attempts, result });
        }
        if (until)
            return until;
    }
    return null;
}
export async function genesisEnrich(payload, publish = true, deps) {
    if (await isSigEnrich(payload)) {
        if (!payload?.mint) {
            payload.mint = await getMint(payload);
        }
        payload.program_id = payload.program_id || SOLANA_PUMP_FUN_PROGRAM_ID;
        try {
            const signature = await discoverSignatures(payload.mint, payload.program_id, deps);
            if (signature) {
                payload.signature = signature;
                console.log('found sigs', signature);
                const repoResult = await fetchOrCreateTxnRepoResult(payload);
                if (publish) {
                    await deps.publisher.publish('logEntry', repoResult);
                }
                //await pairsRepo.enrich(pair_id, { signature: genesisSignature });
                //await metaDataRepo.enrich(pair_id, { signature: genesisSignature });
                console.log({
                    logType: 'info',
                    message: 'genesisLookup found signature',
                    details: { signature }
                });
            }
        }
        catch (err) {
            console.error({
                logType: 'error',
                message: 'genesisLookup failed',
                details: { mint: payload.mint, error: String(err) }
            });
        }
    }
    return payload;
}
