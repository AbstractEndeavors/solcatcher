import {} from '@imports';
import { resolvePairRow } from './resolve.js';
export async function getPairRow(repos, params) {
    if (params.pair)
        return params.pair;
    return resolvePairRow(repos, params);
}
