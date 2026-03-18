import {} from '@imports';
import { getDeps } from '@repoServices';
import { buildEnrichOnchainParams, buildEnrichOffchainParams } from './build.js';
import { getUri } from './enrich/index.js';
import { fetchOffchainJson } from './fetch.js';
import { getMetaId } from './get.js';
/* -------------------------------------------------- */
/* Upsert                                             */
/* -------------------------------------------------- */
export async function upsertOnchainMetaData(chainData, payload = null, deps = null) {
    const meta_id = await getMetaId(payload, deps);
    if (!meta_id || !chainData)
        return null;
    const { metaDataRepo } = await getDeps(deps);
    try {
        return await metaDataRepo.enrichOnchain(meta_id, buildEnrichOnchainParams(chainData));
    }
    catch (err) {
        console.error({
            logType: 'error',
            message: 'onchainEnrich: upsert failed',
            details: { meta_id, error: String(err) },
        });
        return null;
    }
}
/* -------------------------------------------------- */
/* Upsert                                             */
/* -------------------------------------------------- */
export async function upsertOffchainMetaData(chainData, payload = null, deps = null) {
    const meta_id = await getMetaId(payload, deps);
    if (!meta_id || !chainData)
        return null;
    try {
        const uri = await getUri(payload);
        const offchain = await fetchOffchainJson(uri);
        const { metaDataRepo } = await getDeps(deps);
        await metaDataRepo.enrichOffchain(meta_id, buildEnrichOffchainParams(offchain));
    }
    catch (err) {
        console.error({
            logType: 'error',
            message: 'onchainEnrich: upsert failed',
            details: { meta_id, error: String(err) },
        });
        return null;
    }
}
