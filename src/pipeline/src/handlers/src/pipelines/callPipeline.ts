
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
  NormalizedEvents
} from '@imports';
import { 
  getDecodeFromPayload,
  classifyPayloadBatch,
  expectRepoValue,
  EventKind,
  normalizeRawEvents
} from '@imports';
import { 
  type AllDeps
} from '@db';
import {buildEnrichmentContext} from './../utils/index.js';
export async function callTxnPayloadSummaries(
  options: RepoResult<LogDataRow>,
  deps:AllDeps
): Promise<BatchPayloadInsertSummary[]> {
    const insert = expectRepoValue(options)
    return await deps.logPayloadService.extractAndInsertFromRawLogData(insert);
}
export async function callTxnPayloads(
  options: RepoResult<LogDataRow>,
  deps:AllDeps
): Promise<LogPayloadRow[]> {
    const payloadBatches = await callTxnPayloadSummaries(options,deps);
    return await deps.logPayloadService.extractPayloadsFromSummaryHydrate(payloadBatches);
}
export async function callTxnEvents(
  options: RepoResult<LogDataRow>,
  deps:AllDeps
): Promise<RawDecodeOutput[]> {
    const payloadBatches = await callTxnPayloads(options,deps);
    const events: RawDecodeOutput[] = [];
    for (const payload of payloadBatches){
        const event = getDecodeFromPayload(payload);
        events.push(event)
    }
    return events
}
export async function callNormalizedEvents(
  options: RepoResult<LogDataRow>,
  deps:AllDeps
): Promise<NormalizedEvents> {
    const payloadBatches = await callTxnEvents(options,deps);
    return  normalizeRawEvents(payloadBatches);
}
export async function callClassifiedEvents(
  options: RepoResult<LogDataRow>,
  deps:AllDeps
):Promise< {
    events: ClassifiedEvent[];
    skipped: number;
}>{
    const payloadBatches = await callTxnPayloads(options,deps);
    return classifyPayloadBatch(payloadBatches,deps.decoderRegistry)
  }

export async function callTxnEventContexts(
  options: RepoResult<LogDataRow>,
  deps:AllDeps
): Promise<CreateContextEnrich[]> {
  const { events, skipped } = await callClassifiedEvents(options,deps);
  if (skipped > 0) {
    console.debug(`[dispatch] skipped ${skipped} undecodable payloads`);
  }
  const contexts: CreateContextEnrich[] = [];
  for (const event of events) {
    switch (event.kind) {
      case EventKind.TRADE:
        contexts.push(await buildEnrichmentContext(deps,event as DecodedTradeEvents));
        break;
      case EventKind.CREATE:
        contexts.push(await buildEnrichmentContext(deps,event as DecodedCreateEvents));
        break;
      case EventKind.UNKNOWN:
        // structured skip — discriminator is logged, not thrown
        console.debug(`[dispatch] skipping unknown discriminator: ${event.discriminator}`);
        break;
    }
  }
  return contexts;
}

