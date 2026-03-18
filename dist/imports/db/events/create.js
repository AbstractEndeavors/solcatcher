import { processCreateEvent, processTradeEvent } from './upsert.js';
export function createTradeEventEntryHandler(deps = null) {
    return async (payload) => {
        // Store raw log data     
        return await processTradeEvent(payload, false, deps);
    };
}
export function createCreateEventEntryHandler(deps = null) {
    return async (payload) => {
        return await processCreateEvent(payload, false, deps);
    };
}
