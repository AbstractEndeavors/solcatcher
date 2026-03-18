// src/pipeline/workers/index.ts

import type { QueueName,  AllDeps } from './../imports/index.js';
import { QueueConfigs } from './../queues/index.js';
import { BatchWorker } from './base.js';
import {QueuePublisher} from './../transport/index.js'; 
import { PairEnrichBatchWorker } from './pairEnrichBatch.js';
import { MetaEnrichBatchWorker } from './metaEnrichBatch.js';

export type WorkerMap = Map<QueueName, BatchWorker<any>>;

// Factory registry
type WorkerFactory = (deps: AllDeps, publisher: QueuePublisher) => BatchWorker<any> | null;

const workerFactories: Partial<Record<QueueName, WorkerFactory>> = {
  pairEnrich: (deps, publisher) => {
    const config = QueueConfigs.pairEnrich.worker;
    if (!config) return null;

    return new PairEnrichBatchWorker(
      { batchSize: config.batchSize, intervalMs: config.intervalMs, publisher },deps
    );
  },

  metaDataEnrich: (deps, publisher) => {
    const config = QueueConfigs.metaDataEnrich.worker;
    if (!config) return null;

    return new MetaEnrichBatchWorker(
      { batchSize: config.batchSize, intervalMs: config.intervalMs, publisher },deps
    );
  },
};

/**
 * Create workers only for specified queues
 */
export function createWorkersForQueues(
  deps: AllDeps,
  publisher: QueuePublisher,
  queues: QueueName[]
): WorkerMap {
  const workers: WorkerMap = new Map();

  for (const queueName of queues) {
    const factory = workerFactories[queueName];
    if (!factory) continue;

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
export function createAllWorkers(deps: AllDeps, publisher: QueuePublisher): WorkerMap {
  return createWorkersForQueues(deps, publisher, Object.keys(workerFactories) as QueueName[]);
}

export async function startAllWorkers(workers: WorkerMap): Promise<void> {
  for (const [name, worker] of workers) {
    await worker.start();
    console.log({ logType: 'info', message: `Worker started: ${name}` });
  }
}

export async function stopAllWorkers(workers: WorkerMap): Promise<void> {
  for (const [name, worker] of workers) {
    await worker.stop();
    console.log({ logType: 'info', message: `Worker stopped: ${name}` });
  }
}

export { BatchWorker } from './base.js';
export { PairEnrichBatchWorker } from './pairEnrichBatch.js';
export { MetaEnrichBatchWorker } from './metaEnrichBatch.js';
