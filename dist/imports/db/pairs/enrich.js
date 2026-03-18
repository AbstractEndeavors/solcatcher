// src/pipeline/handlers/pairEnrich.ts
import { getDeps } from '@repoServices';
export async function pairEnrich(payload, deps = null) {
    deps = await getDeps(deps);
    const { logOrchestrator } = deps;
    return await logOrchestrator.enrichPair(payload);
}
;
export function createPairEnrichHandler(deps) {
    return async (payload) => {
        return await pairEnrich(payload, deps);
    };
}
