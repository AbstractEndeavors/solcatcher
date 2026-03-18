// src/pipeline/handlers/index.ts
// ═══════════════════════════════════════════════════════════════════

import type { QueueHandler, QueueName } from './../imports/index.js';
import type { QueuePublisher } from '../transport/publisher.js';
import { Registry } from './../registry.js';
import type { AllDeps } from '@db';
import {
createLogIntakeHandler,
createLogEntryHandler,
createTxnEntryHandler,
createCreateEventEntryHandler,
createTradeEventEntryHandler,
createGenesisEnrichHandler,
createPairEnrichHandler,
createGenesisLookupHandler,
createMetaDataEnrichHandler,
createPairProvinenceEnrichHandler,
createEnrichmentPipelineHandler,
createOnChainMetaDataEnrichHandler,
createOffChainMetaDataEnrichHandler,
createMetaDataGenesisInsertHandler,
createPairGenesisInsertHandler,
createTransactionInsertHandler
} from './main.js';
export type HandlerMap = { [K in QueueName]?: QueueHandler<K> };

// Factory registry - maps queue name to handler creator
type HandlerFactory = (deps: AllDeps, publisher: QueuePublisher) => QueueHandler<any>;

const handlerFactories: Record<string, HandlerFactory> = {
  logIntake:                        (deps) =>              createLogIntakeHandler(deps),
  logEntry:                         (deps) =>               createLogEntryHandler(deps),
  txnEntry:                         (deps) =>               createTxnEntryHandler(deps),
  createEventEntry:                 (deps) =>       createCreateEventEntryHandler(deps),
  tradeEventEntry:                  (deps) =>        createTradeEventEntryHandler(deps),
  genesisLookup:                    (deps) =>          createGenesisLookupHandler(deps),
  genesisEnrich:                    (deps) =>          createGenesisEnrichHandler(deps),
  metaDataEnrich:                   (deps) =>         createMetaDataEnrichHandler(deps),
  onChainMetaDataEnrich:            (deps) =>  createOnChainMetaDataEnrichHandler(deps),
  pairProvinenceEnrich:             (deps) =>   createPairProvinenceEnrichHandler(deps),
  offChainMetaDataEnrich:           (deps) => createOffChainMetaDataEnrichHandler(deps),
  pairEnrich:                       (deps) =>             createPairEnrichHandler(deps),
  enrichmentPipelineEntry:          (deps) =>     createEnrichmentPipelineHandler(deps),
  pairGenesisInsert:                (deps) =>     createPairGenesisInsertHandler(deps),
  metaDataGenesisInsert:            (deps) =>     createMetaDataGenesisInsertHandler(deps),
  transactionInsert:                (deps) =>     createTransactionInsertHandler(deps),
};

/**
 * Create handlers only for specified queues
 */
export function createHandlersForQueues(
  deps: AllDeps,
  publisher: QueuePublisher,
  queues: QueueName[]
): HandlerMap {
  const handlers: HandlerMap = {};

  for (const queueName of queues) {
    const factory = handlerFactories[queueName];
    if (!factory) {
      console.warn({ logType: 'warn', message: `No handler factory for queue: ${queueName}` });
      continue;
    }

    try {
      handlers[queueName] = factory(deps, publisher);
      //console.log({ logType: 'debug', message: `Created handler: ${queueName}` });
    } catch (err) {
      console.error({
        logType: 'error',
        message: `Failed to create handler: ${queueName}`,
        details: { error: err instanceof Error ? err.message : String(err) }
      });
      throw err;
    }
  }

  // Register with registry
  Registry.registerHandlers(handlers as any);

  return handlers;
}

/**
 * Create all handlers
 */
export function createAllHandlers(deps: AllDeps, publisher: QueuePublisher): HandlerMap {
  return createHandlersForQueues(deps, publisher, Object.keys(handlerFactories) as QueueName[]);
}
