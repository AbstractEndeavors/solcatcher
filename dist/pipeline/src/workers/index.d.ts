import type { QueueName, QueuePublisher, PipelineDeps } from '../queues/definitions.js';
import { BatchWorker } from './base.js';
export type WorkerMap = Map<QueueName, BatchWorker<any>>;
/**
 * Create workers only for specified queues
 */
export declare function createWorkersForQueues(deps: PipelineDeps, publisher: QueuePublisher, queues: QueueName[]): WorkerMap;
/**
 * Create all workers
 */
export declare function createAllWorkers(deps: PipelineDeps, publisher: QueuePublisher): WorkerMap;
export declare function startAllWorkers(workers: WorkerMap): Promise<void>;
export declare function stopAllWorkers(workers: WorkerMap): Promise<void>;
export { BatchWorker } from './base.js';
export { PairEnrichBatchWorker } from './pairEnrichBatch.js';
export { MetaEnrichBatchWorker } from './metaEnrichBatch.js';
