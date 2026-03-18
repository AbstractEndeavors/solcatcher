import { MetaDataRepository } from './../MetaDataRepository.js';
import { QueryRegistry } from './../../query-registry.js';
import { firstRowIdOrNull } from '@imports';
// Fixed insertIdentity - creates minimal stub
export async function insertIdentity(params) {
    const res = await this.db.query(QueryRegistry.INSERT_IDENTITY, [params.mint, params.program_id]);
    const id = firstRowIdOrNull(res);
    if (id)
        return id;
    // Conflict → fetch existing
    const existing = await this.fetchByMint(params.mint);
    if (!existing) {
        throw new Error('insertIdentity(): invariant violation');
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
        if (row.signature == null)
            enrichType.push('genesis');
        if (!row.onchain_metadata)
            enrichType.push('onchain');
        if (!row.onchain_metadata)
            enrichType.push('metadata');
        return { id: row.id, needsEnrich: enrichType.length !== 0, enrichType, row };
    }
    enrichType = ['onchain', 'metadata', 'genesis'];
    const id = await this.insertIdentity(params);
    row = await this.fetch(params);
    return { id, needsEnrich: true, enrichType, row };
}
