// src/pipeline/handlers/txnEntry.ts
//
// UPDATED: Two paths based on what arrives from the queue.
//
// Fast path (normal flow):
//   logEntry returns IngestResult → txnEntry receives it with decoded events
//   → decodePayloads() sees hasDecodedEvents → routes pre-decoded trades/creates
//   → zero re-fetch, zero re-decode
//
// Slow path (re-processing, manual trigger):
//   payload is plain { id, signature } → getLogPayloadContext → eventOrchistrator
//   → full decode from DB
import { getDeps } from '@repoServices';
import { EventKind } from '@imports';
export async function txnEntry(events, deps = null) {
    deps = await getDeps(deps);
    for (const event of events) {
        switch (event.kind) {
            case EventKind.TRADE:
                await deps.publisher.publish('tradeEventEntry', event);
                break;
            case EventKind.CREATE:
                await deps.publisher.publish('createEventEntry', event);
                break;
            case EventKind.UNKNOWN:
                // structured skip — discriminator is logged, not thrown
                console.debug(`[dispatch] skipping unknown discriminator: ${event.discriminator}`);
                break;
        }
    }
    return null;
}
export function createTxnEntryHandler(deps = null) {
    return async (payload) => {
        return await txnEntry(payload, deps);
    };
}
