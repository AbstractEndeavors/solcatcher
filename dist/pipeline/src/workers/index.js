// src/pipeline/workers/index.ts
import { QueueConfigs } from '../queues/registry.js';
import { BatchWorker } from './base.js';
import { PairEnrichBatchWorker } from './pairEnrichBatch.js';
import { MetaEnrichBatchWorker } from './metaEnrichBatch.js';
const workerFactories = {
    pairEnrich: (deps, publisher) => {
        const config = QueueConfigs.pairEnrich.worker;
        if (!config)
            return null;
        return new PairEnrichBatchWorker({ batchSize: config.batchSize, intervalMs: config.intervalMs, publisher }, { pairsRepo: deps.pairsRepo });
    },
    metaEnrich: (deps, publisher) => {
        const config = QueueConfigs.metaEnrich.worker;
        if (!config)
            return null;
        return new MetaEnrichBatchWorker({ batchSize: config.batchSize, intervalMs: config.intervalMs, publisher }, { metaDataRepo: deps.metaDataRepo });
    },
};
/**
 * Create workers only for specified queues
 */
export function createWorkersForQueues(deps, publisher, queues) {
    const workers = new Map();
    for (const queueName of queues) {
        const factory = workerFactories[queueName];
        if (!factory)
            continue;
        const worker = factory(deps, publisher);
        if (worker) {
            workers.set(queueName, worker);
            console.log({ logType: 'debug', message: `Created worker: ${queueName}` });
        }
    }
    return workers;
}
/**
 * Create all workers
 */
export function createAllWorkers(deps, publisher) {
    return createWorkersForQueues(deps, publisher, Object.keys(workerFactories));
}
export async function startAllWorkers(workers) {
    for (const [name, worker] of workers) {
        await worker.start();
        console.log({ logType: 'info', message: `Worker started: ${name}` });
    }
}
export async function stopAllWorkers(workers) {
    for (const [name, worker] of workers) {
        await worker.stop();
        console.log({ logType: 'info', message: `Worker stopped: ${name}` });
    }
}
export { BatchWorker } from './base.js';
export { PairEnrichBatchWorker } from './pairEnrichBatch.js';
export { MetaEnrichBatchWorker } from './metaEnrichBatch.js';
