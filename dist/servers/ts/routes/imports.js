import { extractRow } from '@imports';
import { getRepoServices } from "@repoServices";
import { fetchMetaData } from "@rateLimiter";
export function getRpcParams(req) {
    return req.method === "POST" ? req.body : req.query;
}
export async function fetchFromChain(params) {
    let { id, mint, limit, latest } = params;
    let result = null;
    if (!mint) {
        const { metaDataService } = await getRepoServices.services();
        let metaData = await metaDataService.fetch({ id, mint, limit, latest });
        if (metaData) {
            mint = extractRow(metaData)?.mint;
        }
    }
    if (!mint) {
        return result;
    }
    return await fetchMetaData(mint);
}
export { fetchMetaData, getRepoServices, extractRow };
