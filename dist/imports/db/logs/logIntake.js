// src/pipeline/handlers/logIntake.ts
import { getDeps } from '@repoServices';
export async function logInsert(payload, deps = null) {
    deps = await getDeps(deps);
    const { logDataRepo } = deps;
    return await deps.logDataRepo.insert(payload);
}
;
export function createLogIntakeHandler(logDataRepo) {
    return async (payload) => {
        return await logDataRepo.insert(payload);
    };
}
