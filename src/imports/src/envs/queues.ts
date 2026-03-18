// src/env/queues.ts
import {requireEnv} from './imports/index.js';
export function loadQueueEnv() {
  const out = {
    workerName: requireEnv("SOLCATCHER_QUEUE_NAME"),
    vhost: requireEnv("SOLCATCHER_QUEUE_VHOST"),
    logIntake:requireEnv("SOLCATCHER_QUEUE_LOG_INTAKE"),
    logEntry:requireEnv("SOLCATCHER_QUEUE_LOG_ENTRY"),
    txnEntry:requireEnv("SOLCATCHER_QUEUE_TXN_ENTRY"),
    tradeEventEntry:requireEnv("SOLCATCHER_QUEUE_TRADE_EVENT_ENTRY"),
    createEventEntry:requireEnv("SOLCATCHER_QUEUE_CREATE_EVENT_ENTRY"),
    genesisLookup:requireEnv("SOLCATCHER_QUEUE_GENESIS_LOOKUP"),
    genesisEntry:requireEnv("SOLCATCHER_QUEUE_GENESIS_ENTRY"),
    genesisEnrich:requireEnv("SOLCATCHER_QUEUE_GENESIS_ENRICH"),
    metaDataEnrich:requireEnv("SOLCATCHER_QUEUE_META_DATA_ENRICH"),
    pairEnrich:requireEnv("SOLCATCHER_QUEUE_PAIR_ENRICH"),
    onChainMetaDataEnrich:requireEnv("SOLCATCHER_QUEUE_ONCHAIN_META_DATA_ENRICH"),
    offChainMetaDataEnrich:requireEnv("SOLCATCHER_QUEUE_OFFCHAIN_META_DATA_ENRICH"),
    enrichmentPipelineEntry:requireEnv("SOLCATCHER_QUEUE_ENRICH_PIPELINE_ENTRY"),
    pairProvinenceEnrich:requireEnv("SOLCATCHER_QUEUE_PAIR_PROVINENCE_ENRICH"),
    metaDataGenesisInsert:requireEnv("SOLCATCHER_QUEUE_META_DATA_GENESIS_INSERT"),
    pairGenesisInsert:requireEnv("SOLCATCHER_QUEUE_PAIRS_GENESIS_INSERT"),
    transactionInsert:requireEnv("SOLCATCHER_QUEUE_TRANSACTION_INSERT"),
  };
 
  return out;
}
