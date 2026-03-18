import type { ConnectionManager } from './connection.js';
import type { QueuePublisher } from './publisher.js';
import type { QueueName, PipelineDeps } from '../queues/definitions.js';
export interface ConsumerMetrics {
    processed: number;
    failed: number;
    retried: number;
    dlq: number;
    errors_by_phase: Record<string, number>;
    errors_by_type: Record<string, number>;
}
export declare class QueueConsumer<T extends QueueName> {
    private readonly connectionManager;
    private readonly queueName;
    private readonly deps;
    private readonly publisher;
    private channel;
    private paused;
    private consumerTag;
    private metrics;
    private errorFactory;
    constructor(connectionManager: ConnectionManager, queueName: T, deps: PipelineDeps, publisher: QueuePublisher);
    start(): Promise<void>;
    private handleMessage;
    private handleError;
    private getRetryCount;
    private republishWithRetry;
    private sendToDlq;
    stop(): Promise<void>;
    pause(): Promise<void>;
    resume(): Promise<void>;
    isPaused(): boolean;
    getMetrics(): ConsumerMetrics;
}
