import { expectSingleRow, } from '@imports';
import { getPairRow } from './../pairs/get.js';
// ============================================================
// META RESOLUTION — find or create the meta row
// ============================================================
export async function resolveMetaRow(repos, params) {
    let { meta_id, mint, program_id } = params;
    let pair = params.pair;
    // Derive identifiers from pair if needed
    if (!meta_id && !mint) {
        pair = pair || (await getPairRow(repos, params));
        meta_id = pair.meta_id;
        mint = pair.mint;
        program_id = program_id ?? pair.program_id;
    }
    let meta = null;
    if (meta_id) {
        meta = (await repos.metaDataRepo.fetchById(meta_id));
    }
    if (!meta && mint) {
        meta = (await repos.metaDataRepo.fetchByMint(mint));
    }
    if (!meta) {
        const id = await repos.metaDataRepo.insertStub(mint, program_id);
        meta = (await repos.metaDataRepo.fetchById(id));
    }
    return expectSingleRow(meta);
}
export async function refreshMetaRow(repos, ctx) {
    return resolveMetaRow(repos, ctx);
}
