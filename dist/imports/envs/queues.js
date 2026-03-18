// src/env/queues.ts
import { getEnvValue, ENVPATH } from './imports.js';
let QueueDisplayed = false;
function requireEnv(key) {
    const val = getEnvValue({ key, startPath: ENVPATH });
    if (!val) {
        throw new Error(`❌ Missing required env var: ${key}`);
    }
    return val;
}
export function loadQueueEnv() {
    const out = {
        workerName: requireEnv("SOLCATCHER_QUEUE_NAME"),
        vhost: requireEnv("SOLCATCHER_QUEUE_VHOST"),
        logIntake: requireEnv("SOLCATCHER_QUEUE_LOG_INTAKE"),
        logEntry: requireEnv("SOLCATCHER_QUEUE_LOG_ENTRY"),
        txnEntry: requireEnv("SOLCATCHER_QUEUE_TXN_ENTRY"),
        tradeEventEntry: requireEnv("SOLCATCHER_QUEUE_TRADE_EVENT_ENTRY"),
        createEventEntry: requireEnv("SOLCATCHER_QUEUE_CREATE_EVENT_ENTRY"),
        genesisLookup: requireEnv("SOLCATCHER_QUEUE_GENESIS_LOOKUP"),
        metaDataEnrich: requireEnv("SOLCATCHER_QUEUE_META_DATA_ENRICH"),
        onChainMetaDataEnrich: requireEnv("SOLCATCHER_QUEUE_ONCHAIN_META_DATA_ENRICH"),
        offChainMetaDataEnrich: requireEnv("SOLCATCHER_QUEUE_OFFCHAIN_META_DATA_ENRICH"),
        enrichmentPipelineEntry: requireEnv("SOLCATCHER_QUEUE_ENRICH_PIPELINE_ENTRY")
    };
    /*if (QueueDisplayed == false){
      console.log("📦 Queue config:", out);
      QueueDisplayed=true
    }*/
    return out;
}
