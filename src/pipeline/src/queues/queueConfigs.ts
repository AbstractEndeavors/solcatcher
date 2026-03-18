import {type QueueName,type QueueConfig,loadQueueEnv} from './../imports/index.js';
// ────────────────────────────────────────────────────────
// QUEUE CONFIGS
// ────────────────────────────────────────────────────────
const env= loadQueueEnv()

export const QueueConfigs: { [K in QueueName]: QueueConfig<K> } = {

  // ─────────────────────────────────────────────────────────
  // TIER 1: CPU-ONLY / PURE ROUTING — no DB, no RPC
  // High prefetch safe. Drop is fine — upstream can re-emit.
  // ─────────────────────────────────────────────────────────

  logIntake: {
    name: 'logIntake',
    envKey: env.logIntake,
    prefetch: 100,         // pure parse + insert, no downstream blocking
    retryStrategy: 'dlq', // don't silently drop raw log data — it's the source of truth
    maxRetries: 2,
    nextQueue: 'logEntry',
    enabled: true,
    worker: undefined,
  },

  logEntry: {
    name: 'logEntry',
    envKey: env.logEntry,
    prefetch: 50,          // CPU-heavy decode but no RPC/DB
    retryStrategy: 'dlq',
    maxRetries: 1,
    nextQueue: 'txnEntry',
    enabled: true,
    worker: undefined,
  },

  enrichmentPipelineEntry: {
    name: 'enrichmentPipelineEntry',
    envKey: env.enrichmentPipelineEntry,
    prefetch: 20,          // just publishes to pairEnrich + metaDataEnrich
    retryStrategy: 'drop',
    maxRetries: 0,
    nextQueue: null,
    enabled: true,
    worker: undefined,
  },

  // ─────────────────────────────────────────────────────────
  // TIER 2: LIGHT DB — single insert/upsert, no lookups
  // Can handle moderate parallelism. Retry on transient failures.
  // ─────────────────────────────────────────────────────────

  txnEntry: {
    name: 'txnEntry',
    envKey: env.txnEntry,
    prefetch: 15,          // just routes ClassifiedEvent[] to trade/create — no DB itself
    retryStrategy: 'drop',
    maxRetries: 0,
    nextQueue: null,
    enabled: true,
    worker: undefined,
  },

  pairGenesisInsert: {
    name: 'pairGenesisInsert',
    envKey: env.pairGenesisInsert,
    prefetch: 10,          // single upsert per message
    retryStrategy: 'requeue',
    maxRetries: 3,
    nextQueue: 'pairEnrich',
    enabled: true,
    worker: undefined,
  },

  metaDataGenesisInsert: {
    name: 'metaDataGenesisInsert',
    envKey: env.metaDataGenesisInsert,
    prefetch: 10,          // single insertGenesis per message
    retryStrategy: 'requeue',
    maxRetries: 3,
    nextQueue: 'metaDataEnrich',
    enabled: true,
    worker: undefined,
  },

  transactionInsert: {
    name: 'transactionInsert',
    envKey: env.transactionInsert,
    prefetch: 10,          // single insertTransactions per message
    retryStrategy: 'requeue',
    maxRetries: 3,
    nextQueue: 'enrichmentPipelineEntry',
    enabled: true,
    worker: undefined,
  },

  // ─────────────────────────────────────────────────────────
  // TIER 3: HEAVY DB — multiple lookups + assureIdentityEnrich
  // Each message touches 2-4 tables. Keep low.
  // ─────────────────────────────────────────────────────────

  tradeEventEntry: {
    name: 'tradeEventEntry',
    envKey: env.tradeEventEntry,
    prefetch: 3,           // getEventContext = 2x assureIdentityEnrich in parallel + txn insert
    retryStrategy: 'requeue',
    maxRetries: 2,         // transient DB errors should retry
    nextQueue: null,
    enabled: true,
    worker: undefined,
  },

  createEventEntry: {
    name: 'createEventEntry',
    envKey: env.createEventEntry,
    prefetch: 3,           // getEventContext + insertGenesis + upsert pair
    retryStrategy: 'requeue',
    maxRetries: 2,
    nextQueue: null,
    enabled: true,
    worker: undefined,
  },

  pairProvinenceEnrich: {
    name: 'pairProvinenceEnrich',
    envKey: env.pairProvinenceEnrich,
    prefetch: 2,           // 3 conditional fetches (log, meta, txn) + upsert
    retryStrategy: 'drop', // batch worker re-feeds on next cycle
    maxRetries: 0,
    enabled: true,
    nextQueue: null,
    worker: {
      batchSize: 20,
      intervalMs: 45_000,
    },
  },

  // ─────────────────────────────────────────────────────────
  // TIER 4: BATCH-FED DB — worker controls the feed rate
  // prefetch:1 because the worker already paces the batch.
  // Drop is intentional — worker re-feeds failed items next cycle.
  // ─────────────────────────────────────────────────────────

  pairEnrich: {
    name: 'pairEnrich',
    envKey: env.pairEnrich,
    prefetch: 8,           // was 1 — batch worker is not the only publisher
    retryStrategy: 'drop', // unchanged
    maxRetries: 0,
    enabled: true,
    nextQueue: null,
    worker: {
      batchSize: 20,
      intervalMs: 30_000,
    },
  },

  metaDataEnrich: {
    name: 'metaDataEnrich',
    envKey: env.metaDataEnrich,
    prefetch: 8,           // was 1 — same reason
    retryStrategy: 'drop', // unchanged
    maxRetries: 0,
    enabled: true,
    nextQueue: null,
    worker: {
      batchSize: 20,
      intervalMs: 30_000,
    },
  },

  // ─────────────────────────────────────────────────────────
  // TIER 5: RPC-BOUND — rate limiter is the constraint, not DB
  // prefetch:1 always. Drop because RPC failures are transient
  // and the enrich pipeline will re-trigger on next batch cycle.
  // ─────────────────────────────────────────────────────────

  genesisEnrich: {
    name: 'genesisEnrich',
    envKey: env.genesisEnrich,
    prefetch: 5,           // deriveAllPDAs + 2 upserts — cheap but sequential
    retryStrategy: 'drop',
    maxRetries: 0,
    enabled: true,
    nextQueue: null,
    worker: undefined,
  },

  onChainMetaDataEnrich: {
    name: 'onChainMetaDataEnrich',
    envKey: env.onChainMetaDataEnrich,
    prefetch: 5,           // single RPC fetchMetaData call — rate limiter owns pacing
    retryStrategy: 'drop',
    maxRetries: 0,
    enabled: true,
    nextQueue: null,
    worker: undefined,
  },

  offChainMetaDataEnrich: {
    name: 'offChainMetaDataEnrich',
    envKey: env.offChainMetaDataEnrich,
    prefetch: 3,           // HTTP fetch — no rate limiter, can run a few in parallel
    retryStrategy: 'drop', // fetchOffchainJson already swallows errors gracefully
    maxRetries: 0,
    enabled: true,
    nextQueue: null,
    worker: undefined,
  },

  // ─────────────────────────────────────────────────────────
  // TIER 6: SLOWEST — up to 40 RPC calls per message
  // prefetch:1 is non-negotiable. Needs retries because a
  // missed genesis signature means the mint stays a stub forever.
  // ─────────────────────────────────────────────────────────

  genesisLookup: {
    name: 'genesisLookup',
    envKey: env.genesisLookup,
    prefetch: 1,           // keep — 40 RPC calls per message
    retryStrategy: 'drop', // was 'requeue' — kills the feedback loop; pairEnrich batch worker re-feeds
    maxRetries: 0,         // was 2
    enabled: true,
    nextQueue: null,
    worker: undefined,
  },
} as const;

export const allQueueNames: QueueName[] = [
  'logIntake', 'logEntry', 'txnEntry',
  'tradeEventEntry', 'createEventEntry', 'enrichmentPipelineEntry',
  'genesisLookup', 'genesisEnrich',
  'pairProvinenceEnrich', 'pairEnrich',
  'metaDataEnrich', 'offChainMetaDataEnrich', 'onChainMetaDataEnrich',
  'pairGenesisInsert', 'metaDataGenesisInsert', 'transactionInsert',
];