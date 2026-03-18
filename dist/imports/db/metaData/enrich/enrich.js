import { firstNormalizedMint, firstNormalizedUri, getDeps, upsertOnchainMetaData, getMetaId, getMint, fetchOnchainMetaData, upsertOffchainMetaData, } from './imports.js';
import { deriveAllPDAsAuto } from '@rateLimiter';
export async function getUri(payload = null, deps = null) {
    if (!payload)
        return null;
    const uri = firstNormalizedUri(payload);
    if (uri)
        return uri;
    payload = await onchainEnrich(payload, deps);
    return firstNormalizedUri(payload);
}
/* -------------------------------------------------- */
/* Orchestrate                                        */
/* -------------------------------------------------- */
export async function offChainEnrich(payload, deps = null) {
    deps = await getDeps(deps);
    const { metaDataRepo } = deps;
    const { id: meta_id, needsEnrich, enrichType, row } = await metaDataRepo.assureIdentityEnrich(payload);
    // Spread into plain object — never pass raw DB row downstream
    payload = {
        ...payload,
        mint: payload.mint || firstNormalizedMint(row),
        meta_id: meta_id || payload.meta_id || await getMetaId(row),
        uri: payload.uri || firstNormalizedUri(row),
    };
    // If still no uri, fetch onchain to get it
    if (!payload.uri) {
        payload = await onchainEnrich(payload, deps);
        payload = { ...payload, uri: firstNormalizedUri(payload) };
    }
    if (needsEnrich && enrichType.includes('offchain')) {
        const chainData = await fetchOnchainMetaData(payload);
        if (chainData) {
            await upsertOffchainMetaData(chainData, payload, deps);
        }
    }
    return payload;
}
/* -------------------------------------------------- */
/* Orchestrate                                        */
/* -------------------------------------------------- */
export async function onchainEnrich(payload, deps = null) {
    const resolvedDeps = await getDeps(deps);
    const { metaDataRepo } = resolvedDeps;
    const { id: meta_id, needsEnrich, enrichType, row } = await metaDataRepo.assureIdentityEnrich(payload);
    payload = {
        ...payload,
        mint: payload.mint || firstNormalizedMint(row),
        meta_id: payload.meta_id || meta_id,
    };
    if (needsEnrich && enrichType.includes('onchain')) {
        const chainData = await fetchOnchainMetaData(payload);
        if (chainData) {
            await upsertOnchainMetaData(chainData, payload, resolvedDeps);
        }
    }
    return payload;
}
export async function signatureMetaEnrich(payload, deps = null) {
    const resolvedDeps = await getDeps(deps);
    const { metaDataRepo } = resolvedDeps;
    const { id: meta_id, needsEnrich, enrichType, row } = await metaDataRepo.assureIdentityEnrich(payload);
    payload = {
        ...payload,
        mint: payload.mint || firstNormalizedMint(row),
        meta_id: payload.meta_id || meta_id,
    };
    if (needsEnrich && enrichType.includes('genesis')) {
        const chainData = await fetchOnchainMetaData(payload);
        if (chainData) {
            await upsertOnchainMetaData(chainData, payload, resolvedDeps);
        }
    }
    return payload;
}
/* -------------------------------------------------- */
/* Orchestrate                                        */
/* -------------------------------------------------- */
export async function metaDataEnrich(payload, deps = null) {
    payload = await onchainEnrich(payload, deps);
    payload = await offChainEnrich(payload, deps);
    payload = await signatureMetaEnrich(payload, deps);
    return payload;
}
// ============================================================
// PDA ENRICHMENT
// ============================================================
export async function enrichPDAs(ctx, _deps) {
    if (ctx.pair.bonding_curve && ctx.pair.associated_bonding_curve && ctx.pair.token_program) {
        return ctx;
    }
    const d = deriveAllPDAsAuto(ctx.pair.mint, ctx.pair.program_id);
    if (!ctx.pair.token_program && d.token_program) {
        ctx.pair.token_program = d.token_program;
        ctx.enrich_fields.pair.push('token_program');
    }
    if (!ctx.pair.bonding_curve && d.bonding_curve) {
        ctx.pair.bonding_curve = d.bonding_curve;
        ctx.enrich_fields.pair.push('bonding_curve');
    }
    if (!ctx.pair.associated_bonding_curve && d.associated_bonding_curve) {
        ctx.pair.associated_bonding_curve = d.associated_bonding_curve;
        ctx.enrich_fields.pair.push('associated_bonding_curve');
    }
    return ctx;
}
