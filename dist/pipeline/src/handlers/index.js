// src/pipeline/handlers/index.ts
// ═══════════════════════════════════════════════════════════════════
import { Registry } from '../registry/index.js';
import {} from '@imports';
import {} from '@imports';
import {} from '@imports';
import { createLogIntakeHandler, createLogEntryHandler, createTxnEntryHandler, createCreateEventEntryHandler, createTradeEventEntryHandler, createEnrichmentPipelineHandler, createGenesisLookupHandler, createMetaDataEnrichHandler, createOnChainMetaDataEnrichHandler, createOffChainMetaDataEnrichHandler, } from '@imports';
const handlerFactories = {
    logIntake: (deps) => createLogIntakeHandler(deps),
    logEntry: (deps) => createLogEntryHandler(deps),
    txnEntry: (deps) => createTxnEntryHandler(deps),
    createEventEntry: (deps) => createCreateEventEntryHandler(deps),
    tradeEventEntry: (deps) => createTradeEventEntryHandler(deps),
    createEnrichmentPipelineHandler: (deps) => createEnrichmentPipelineHandler(deps),
    genesisLookup: (deps) => createGenesisLookupHandler(deps),
    metaDataEnrich: (deps) => createMetaDataEnrichHandler(deps),
    onChainMetaDataEnrich: (deps) => createOnChainMetaDataEnrichHandler(deps),
    offChainMetaDataEnrich: (deps) => createOffChainMetaDataEnrichHandler(deps),
};
/**
 * Create handlers only for specified queues
 */
export function createHandlersForQueues(deps, publisher, queues) {
    const handlers = {};
    for (const queueName of queues) {
        const factory = handlerFactories[queueName];
        if (!factory) {
            console.warn({ logType: 'warn', message: `No handler factory for queue: ${queueName}` });
            continue;
        }
        try {
            handlers[queueName] = factory(deps, publisher);
            console.log({ logType: 'debug', message: `Created handler: ${queueName}` });
        }
        catch (err) {
            console.error({
                logType: 'error',
                message: `Failed to create handler: ${queueName}`,
                details: { error: err instanceof Error ? err.message : String(err) }
            });
            throw err;
        }
    }
    // Register with registry
    Registry.registerHandlers(handlers);
    return handlers;
}
/**
 * Create all handlers
 */
export function createAllHandlers(deps, publisher) {
    return createHandlersForQueues(deps, publisher, Object.keys(handlerFactories));
}
