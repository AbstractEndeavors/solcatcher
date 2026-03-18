/**
 * LOG DATA PIPELINE
 *
 * Clean, maintainable TypeScript architecture following:
 * - Queues over callbacks
 * - Registries over globals
 * - Schemas over ad-hoc objects
 * - Explicit environment wiring
 */
export { LogDataService, createLogDataService, decodeLogsB64 } from './service.js';
export { LogDataRepository, createLogDataRepository } from './repository/index.js';
export type { LogDataServiceConfig } from './service.js';
export { QueryRegistry } from './query-registry.js';
export { BatchQueue, BatchBuffer, createBatchBuffer, type BatchBufferConfig, type BatchProcessor, DEFAULT_BATCH_CONFIG, } from './batch-queue.js';
