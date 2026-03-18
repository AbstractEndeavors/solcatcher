import { callClassifiedEvents } from './../genesis/payloadPipeline.js';
export async function logEntry(payload, deps = null) {
    const { events } = await callClassifiedEvents(payload);
    return events;
}
;
export function createLogEntryHandler(deps = null) {
    return async (payload) => {
        return await logEntry(payload, deps);
    };
}
