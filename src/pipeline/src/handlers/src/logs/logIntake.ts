// src/pipeline/handlers/logIntake.ts


import type { RepoResult,LogIntakePayload,LogDataRow} from '@imports';
import { type AllDeps } from '@repoServices';
export async function logInsert(
  payload: LogIntakePayload,
  deps: AllDeps
):Promise<RepoResult<LogDataRow>> {
    return await deps.logDataRepo.insert(payload);
};

