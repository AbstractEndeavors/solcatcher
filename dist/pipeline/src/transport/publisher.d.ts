import type { ConnectionManager } from './connection.js';
import type { QueueName, QueuePayloadMap, QueuePublisher as IQueuePublisher } from '../queues/definitions.js';
export declare class QueuePublisher implements IQueuePublisher {
    private readonly connectionManager;
    private channel;
    private readonly assertedQueues;
    constructor(connectionManager: ConnectionManager);
    private ensureChannel;
    private ensureQueue;
    publish<T extends QueueName>(queue: T, payload: QueuePayloadMap[T]): Promise<void>;
    publishBatch<T extends QueueName>(queue: T, payloads: QueuePayloadMap[T][]): Promise<void>;
    /** Optional: eager warm-up — assert all queues at startup. */
    warmUp(): Promise<void>;
    teardown(): Promise<void>;
}
/**
 * Sync. Registers the ConnectionManager and creates the singleton.
 * No rabbit calls happen here — safe to call before anything is up.
 * Call this as early as possible in every entry point.
 */
export declare function registerConnectionManager(connectionManager: ConnectionManager): QueuePublisher;
/**
 * Returns the publisher singleton.
 * Throws only if registerConnectionManager was never called.
 */
export declare function getPublisher(): QueuePublisher;
/**
 * Bootstrap compat: registers CM and warms up all queues.
 * Use in pipeline bootstrap if you want eager validation.
 * No longer a prerequisite for getPublisher().
 */
export declare function initPublisher(connectionManager: ConnectionManager): Promise<QueuePublisher>;
