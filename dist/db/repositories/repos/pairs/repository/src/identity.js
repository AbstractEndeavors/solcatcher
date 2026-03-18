import { PairsRepository } from '../PairsRepository.js';
import { QueryRegistry } from './../../query-registry.js';
import { firstRowIdOrNull } from '@imports';
import { SOLANA_PUMP_FUN_PROGRAM_ID as program_id } from '@imports';
// Fixed insertIdentity - creates minimal stub
export async function insertIdentity(params) {
    const res = await this.db.query(QueryRegistry.INSERT_IDENTITY, [params.mint, params.program_id || program_id]);
    const id = firstRowIdOrNull(res);
    if (id)
        return id;
    // DO NOTHING returned no row — concurrent insert won the race, fetch theirs
    const existing = await this.fetchByMintAndProgram(params.mint, params.program_id || program_id);
    if (!existing) {
        throw new Error(`insertIdentity(): invariant violation — insert silenced but row not found ` +
            `mint=${params.mint} program_id=${params.program_id}`);
    }
    return existing.id;
}
export async function assureIdentity(params) {
    const row = await this.fetch(params);
    if (row) {
        return row.id;
    }
    return await this.insertIdentity(params);
}
export async function assureIdentityEnrich(params) {
    let row = await this.fetch(params);
    let enrichType = [];
    if (row) {
        const pairRow = row;
        if (row.signature == null) {
            enrichType.push('genesis');
        }
        const needsEnrich = enrichType.length != 0;
        return { id: row.id, needsEnrich, enrichType, row: pairRow };
    }
    enrichType = ['genesis'];
    const id = await this.insertIdentity(params);
    row = await this.fetch(params);
    return { id, needsEnrich: true, enrichType, row };
}
