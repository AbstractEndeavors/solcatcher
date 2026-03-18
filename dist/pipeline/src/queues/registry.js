// src/pipeline/queues/registry.ts
// ═══════════════════════════════════════════════════════════════════
// QUEUE CONFIGURATIONS - WITH SELECTIVE ENABLE/DISABLE
// ═══════════════════════════════════════════════════════════════════
import { loadQueueEnv } from '@imports';
// ────────────────────────────────────────────────────────
// ENVIRONMENT LOADING
// ────────────────────────────────────────────────────────
/**
 * Parse enable flags from environment.
 *
 * Supports:
 *   PIPELINE_QUEUES=logIntake,logEntry,txnEntry  (whitelist)
 *   PIPELINE_QUEUES=all                          (enable all)
 *   PIPELINE_QUEUES=none                         (disable all)
 *   QUEUE_LOG_INTAKE_ENABLED=false               (per-queue override)
 *   WORKER_PAIR_ENRICH_ENABLED=false             (per-worker override)
 */
function parseEnableFlags() {
    const pipelineQueues = process.env.PIPELINE_QUEUES?.trim().toLowerCase();
    let queues = 'all';
    if (pipelineQueues === 'none') {
        queues = 'none';
    }
    else if (pipelineQueues && pipelineQueues !== 'all') {
        const names = pipelineQueues.split(',').map(s => s.trim());
        queues = new Set(names);
    }
    const queueOverrides = new Map();
    const workerOverrides = new Map();
    const allQueueNames = [
        'logIntake', 'logEntry', 'txnEntry',
        'tradeEventEntry', 'createEventEntry', 'enrichmentPipelineEntry',
        'genesisLookup',
        'metaDataEnrich', 'offChainMetaDataEnrich', 'onChainMetaDataEnrich'
    ];
    for (const name of allQueueNames) {
        const queueEnvKey = `QUEUE_${camelToScreamingSnake(name)}_ENABLED`;
        const queueEnvVal = process.env[queueEnvKey];
        if (queueEnvVal !== undefined) {
            queueOverrides.set(name, queueEnvVal.toLowerCase() === 'true');
        }
        const workerEnvKey = `WORKER_${camelToScreamingSnake(name)}_ENABLED`;
        const workerEnvVal = process.env[workerEnvKey];
        if (workerEnvVal !== undefined) {
            workerOverrides.set(name, workerEnvVal.toLowerCase() === 'true');
        }
    }
    return { queues, queueOverrides, workerOverrides };
}
function camelToScreamingSnake(str) {
    return str.replace(/([A-Z])/g, '_$1').toUpperCase();
}
const env = loadQueueEnv();
console.log(env);
const enableFlags = parseEnableFlags();
// ────────────────────────────────────────────────────────
// QUEUE CONFIGS
// ────────────────────────────────────────────────────────
export const QueueConfigs = {
    // ─────────────────────────────
    // CPU-FIRST, NO DB
    // ─────────────────────────────
    logIntake: {
        name: 'logIntake',
        envKey: env.logIntake,
        prefetch: 50, // CPU-only
        retryStrategy: 'drop',
        maxRetries: 0,
        nextQueue: 'logEntry',
        enabled: true,
        worker: undefined,
    },
    logEntry: {
        name: 'logEntry',
        envKey: env.logEntry,
        prefetch: 25, // still CPU-heavy
        retryStrategy: 'dlq',
        maxRetries: 0,
        nextQueue: 'txnEntry',
        enabled: true,
        worker: undefined,
    },
    // ─────────────────────────────
    // DB-BOUND — MUST BE LOW
    // ─────────────────────────────
    txnEntry: {
        name: 'txnEntry',
        envKey: env.txnEntry,
        prefetch: 3,
        retryStrategy: 'dlq',
        maxRetries: 0,
        nextQueue: null,
        enabled: true,
        worker: undefined,
    },
    tradeEventEntry: {
        name: 'tradeEventEntry',
        envKey: env.tradeEventEntry,
        prefetch: 2, // 🔥 biggest offender
        retryStrategy: 'requeue',
        maxRetries: 0,
        nextQueue: null,
        enabled: true,
        worker: undefined,
    },
    createEventEntry: {
        name: 'createEventEntry',
        envKey: env.createEventEntry,
        prefetch: 2,
        retryStrategy: 'requeue',
        maxRetries: 0,
        nextQueue: null,
        enabled: true,
        worker: undefined,
    },
    enrichmentPipelineEntry: {
        name: 'enrichmentPipelineEntry',
        envKey: env.enrichmentPipelineEntry,
        prefetch: 2,
        retryStrategy: 'requeue',
        maxRetries: 1,
        nextQueue: null,
        enabled: true,
        worker: undefined,
    },
    // ─────────────────────────────
    // BATCH / ENRICH (VERY DB HEAVY)
    // ─────────────────────────────
    metaDataEnrich: {
        name: 'metaDataEnrich',
        envKey: env.metaDataEnrich,
        prefetch: 1,
        retryStrategy: 'requeue',
        maxRetries: 1,
        enabled: true,
        nextQueue: null,
        worker: {
            batchSize: 25, // ↓ from 100
            intervalMs: 30_000, // ↓ from 60s
        },
    },
    onChainMetaDataEnrich: {
        name: 'onChainMetaDataEnrich',
        envKey: env.onChainMetaDataEnrich,
        prefetch: 1,
        retryStrategy: 'requeue',
        maxRetries: 0,
        enabled: true,
        nextQueue: null,
        worker: undefined,
    },
    offChainMetaDataEnrich: {
        name: 'offChainMetaDataEnrich',
        envKey: env.offChainMetaDataEnrich,
        prefetch: 1,
        retryStrategy: 'requeue',
        maxRetries: 0,
        enabled: true,
        nextQueue: null,
        worker: undefined,
    },
    genesisLookup: {
        name: 'genesisLookup',
        envKey: env.genesisLookup,
        prefetch: 1,
        retryStrategy: 'drop',
        maxRetries: 0,
        enabled: true,
        nextQueue: null,
        worker: undefined,
    },
};
// ────────────────────────────────────────────────────────
// ENABLE/DISABLE LOGIC
// ────────────────────────────────────────────────────────
export function isQueueEnabled(name) {
    if (!QueueConfigs[name])
        return false; // unknown name → treat as disabled
    if (enableFlags.queueOverrides.has(name)) {
        return enableFlags.queueOverrides.get(name);
    }
    if (enableFlags.queues === 'none')
        return false;
    if (enableFlags.queues === 'all')
        return QueueConfigs[name].enabled;
    return enableFlags.queues.has(name);
}
export function isWorkerEnabled(name) {
    if (!QueueConfigs[name].worker)
        return false;
    if (enableFlags.workerOverrides.has(name)) {
        return enableFlags.workerOverrides.get(name);
    }
    return isQueueEnabled(name);
}
// ────────────────────────────────────────────────────────
// GETTERS
// ────────────────────────────────────────────────────────
export function getQueueConfig(name) {
    return QueueConfigs[name];
}
export function getAllQueueNames() {
    return Object.keys(QueueConfigs);
}
export function getEnabledQueueNames() {
    return getAllQueueNames().filter(isQueueEnabled);
}
export function getEnabledWorkerNames() {
    return getAllQueueNames().filter(isWorkerEnabled);
}
export function getQueuesWithWorkers() {
    return getAllQueueNames().filter(name => QueueConfigs[name].worker);
}
// ────────────────────────────────────────────────────────
// STATUS / DEBUG
// ────────────────────────────────────────────────────────
export function getQueueStatus() {
    return getAllQueueNames().map(name => ({
        name,
        enabled: isQueueEnabled(name),
        workerEnabled: isWorkerEnabled(name),
        hasWorker: !!QueueConfigs[name].worker,
    }));
}
export function logQueueStatus() {
    const status = getQueueStatus();
    console.log({
        logType: 'info',
        message: 'Queue configuration',
        details: {
            enabledQueues: status.filter(s => s.enabled).map(s => s.name),
            enabledWorkers: status.filter(s => s.workerEnabled).map(s => s.name),
            disabledQueues: status.filter(s => !s.enabled).map(s => s.name),
        }
    });
}
