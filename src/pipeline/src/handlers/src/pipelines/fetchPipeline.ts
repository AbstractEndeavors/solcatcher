import type {
  BatchPayloadInsertSummary,
  RawDecodeOutput,
  LogPayloadRow,
  RepoResult,
  LogDataRow,
  CreateContextEnrich,
  ClassifiedEvent,
  DecodedCreateEvents,
  DecodedTradeEvents,
  EnrichParams,
  NormalizedEvents,
} from '@imports';
import { 
  getDecodeFromPayload,
  classifyPayloadBatch,
  expectRepoValue,
  EventKind,
  normalizeRawEvents,
} from '@imports';
import { 
  type AllDeps
} from '@db';
import { 
  fetchTxnInsertData 
} from '@rateLimiter';
// ============================================================
// kind is already set by classifier — switch on it directly.
// No re-extraction. No guard re-runs.
// ============================================================
export async function fetchAndInsertTxn(
  options: EnrichParams,
  deps: AllDeps
): Promise<RepoResult<LogDataRow>> {
  const payload = await fetchTxnInsertData(options,deps);
  if (!payload.ok) return payload;
  return deps.logDataService.r.insert(payload.value);
}

export async function fetchTxnRepoData(
  options: EnrichParams,
  deps: AllDeps
): Promise<RepoResult<LogDataRow>> {
  return deps.logDataService.fetch(options);
}

export async function fetchOrCreateTxnRepoResult(
  options: EnrichParams,
  deps: AllDeps
): Promise<RepoResult<LogDataRow>> {
  const existing = await fetchTxnRepoData(options, deps);
  if (existing.ok) return existing;
  // only fetch+insert if not_found — don't mask db_errors
  if (existing.reason !== 'not_found') return existing;
  return fetchAndInsertTxn(options, deps);
}
export async function fetchOrCreateTxnRepoValue(
  options: EnrichParams,
    deps:AllDeps
): Promise<LogDataRow> {
  const repoResult = await fetchOrCreateTxnRepoResult(options,deps);
  return expectRepoValue(repoResult, 'fetchOrCreateTxn');
}
export async function fetchOrCreateTxnPayloadSummaries(
  options: EnrichParams,
    deps:AllDeps
): Promise<BatchPayloadInsertSummary[]> {
    const logData = await fetchOrCreateTxnRepoValue(options,deps);
    return await deps.logPayloadService.extractAndInsertFromRawLogData(logData);
}
export async function fetchOrCreateTxnPayloads(
  options: EnrichParams,
    deps:AllDeps
): Promise<LogPayloadRow[]> {
    const payloadBatches = await fetchOrCreateTxnPayloadSummaries(options,deps);
    return await deps.logPayloadService.extractPayloadsFromSummaryHydrate(payloadBatches);
}
export async function fetchOrCreateTxnEvents(
  options: EnrichParams,
    deps:AllDeps
): Promise<RawDecodeOutput[]> {
    const payloadBatches = await fetchOrCreateTxnPayloads(options,deps);
    const events: RawDecodeOutput[] = [];
    for (const payload of payloadBatches){
        const event = getDecodeFromPayload(payload);
        events.push(event)
    }
    return events
}
export async function fetchOrCreateNormalizedEvents(
  options: EnrichParams,
    deps:AllDeps
): Promise<NormalizedEvents> {
    const payloadBatches = await fetchOrCreateTxnEvents(options,deps);
    return  normalizeRawEvents(payloadBatches);
}
export async function fetchOrCreateClassifiedEvents(
  options: EnrichParams,
    deps:AllDeps
):Promise< {
    events: ClassifiedEvent[];
    skipped: number;
}>{
    const payloadBatches = await fetchOrCreateTxnPayloads(options,deps);
    return classifyPayloadBatch(payloadBatches,deps.decoderRegistry)
  }

