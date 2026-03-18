import { firstNormalizedId, } from './../../interfaces/index.js';
import { getDeps } from './../db.js';
import { resolveMetaRow } from './resolve.js';
/* -------------------------------------------------- */
/* Helpers                                            */
/* -------------------------------------------------- */
export async function getMetaId(payload = null, deps = null) {
    if (!payload)
        return null;
    const meta_id = firstNormalizedId(payload, // payload.meta_id, payload.id
    payload.meta);
    if (meta_id)
        return meta_id;
    const { metaDataRepo } = await getDeps(deps);
    const identity = await metaDataRepo.assureIdentityEnrich(payload);
    return firstNormalizedId(identity);
}
export async function getMetaRow(repos, params) {
    if (params.meta)
        return params.meta;
    return resolveMetaRow(repos, params);
}
