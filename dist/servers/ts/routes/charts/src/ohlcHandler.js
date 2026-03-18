import { createOHLCHandler } from "./ohlc.js";
import { getRepoServices } from "@repoServices";
// Lazy-initialized handler (services are async)
let _ohlcHandler = null;
export async function getOHLCHandler() {
    if (_ohlcHandler)
        return _ohlcHandler;
    const { pairsService, transactionsService } = await getRepoServices.services();
    _ohlcHandler = createOHLCHandler({
        get_transactions: async ({ pair_id }) => {
            // Fetch pair to get tcns array
            const pair = await pairsService.fetchById(pair_id);
            if (!pair?.tcns?.length)
                return [];
            // Fetch transactions by their IDs
            return transactionsService.fetchByIds(pair.tcns);
        },
        get_pair: ({ pair_id, signature }) => {
            if (pair_id) {
                return pairsService.fetchById(pair_id);
            }
            if (signature) {
                return pairsService.fetchBySignature(signature);
            }
            return null;
        },
        get_creation_decoded_data: ({ pair_id }) => {
            // If you have a separate creation data lookup, wire it here
            // For now, just return the pair data
            return pairsService.fetchById(pair_id);
        },
    });
    return _ohlcHandler;
}
