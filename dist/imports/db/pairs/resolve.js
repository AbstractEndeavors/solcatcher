import { expectSingleRow, } from '@imports';
// ============================================================
// PAIR RESOLUTION — find or create the pair row
// ============================================================
export async function resolvePairRow(repos, params) {
    const { pair_id, mint, program_id } = params;
    let pair = null;
    if (pair_id) {
        pair = (await repos.pairsRepo.fetchById(pair_id));
    }
    if (!pair && mint) {
        pair = (await repos.pairsRepo.fetchByMint(mint));
    }
    if (!pair) {
        const id = await repos.pairsRepo.insertIdentity({ mint, program_id });
        pair = (await repos.pairsRepo.fetchById(id));
    }
    return expectSingleRow(pair);
}
