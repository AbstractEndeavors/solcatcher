import { firstNormalizedMint, } from './../../interfaces/index.js';
import { SOLANA_PUMP_FUN_PROGRAM_ID } from '@imports';
import { getDeps } from './../db.js';
export async function getPayload(payload = null, deps = null) {
    if (!payload)
        return null;
    let mint = firstNormalizedMint(payload);
    const { metaDataRepo, pairsRepo } = await getDeps(deps);
    mint = firstNormalizedMint(payload.pair);
    payload.program_id = payload.program_id || SOLANA_PUMP_FUN_PROGRAM_ID;
    let identity;
    if (!mint) {
        identity = await pairsRepo.assureIdentityEnrich(payload);
        payload.pair = identity.row;
        payload.pair.program_id = payload.pair.program_id || payload.program_id;
    }
    mint = firstNormalizedMint(payload.meta);
    if (!mint) {
        identity = await metaDataRepo.assureIdentityEnrich(payload);
        payload.meta = identity.row;
        payload.meta.program_id = payload.meta.program_id || payload.program_id;
    }
    payload.mint = firstNormalizedMint(payload.meta);
    return payload;
}
export async function getMint(payload = null, deps = null) {
    if (!payload)
        return null;
    // Probe all known mint-bearing fields before touching the DB
    const mint = firstNormalizedMint(payload, // payload.mint, payload.mintAddress etc.
    payload.meta, // meta.mint
    payload.pair);
    if (mint)
        return mint;
    // Only hit DB if all local candidates exhausted
    payload = await getPayload(payload, deps);
    if (!payload)
        return null;
    return firstNormalizedMint(payload, // payload.mint, payload.mintAddress etc.
    payload.meta, // meta.mint
    payload.pair);
}
export async function isSigEnrich(payload = null, deps = null) {
    if (!payload)
        return false;
    const { metaDataRepo, pairsRepo } = await getDeps(deps);
    let identity;
    identity = await pairsRepo.assureIdentityEnrich(payload);
    if (identity.needsEnrich && identity.enrichType.includes('genesis')) {
        return true;
    }
    identity = await metaDataRepo.assureIdentityEnrich(payload);
    if (identity.needsEnrich && identity.enrichType.includes('genesis')) {
        return true;
    }
    return false;
}
