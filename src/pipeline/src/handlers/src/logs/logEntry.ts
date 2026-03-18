// src/pipeline/handlers/logEntry.ts
import  type {AllDeps } from '@db';
import { type ClassifiedEvent, type RepoResult,LogDataRow,expectRepoValue,classifyPayloadBatch} from '@imports';

export async function repoResultToClassifiedEvents(
  result: RepoResult<LogDataRow>,
  deps: AllDeps
): Promise<ClassifiedEvent[]> {
  const insert = expectRepoValue(result);
  const payloadBatches = await deps.logPayloadService.extractAndInsertFromRawLogData(insert);
  const payloads = await deps.logPayloadService.extractPayloadsFromSummaryHydrate(payloadBatches);
  const { events } = classifyPayloadBatch(payloads, deps.decoderRegistry);
  // Forward log_id and slot — eliminates fetchBySignature in getEventContext
  return events.map(event => ({
    ...event,
    log_id: insert.id,
    slot:   insert.slot,
  }));
}

