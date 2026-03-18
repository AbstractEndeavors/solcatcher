import type { QueueName, QueuePayloadMap, QueuePublisher } from '@Pipeline/src/queues/definitions.js';
export interface BatchWorkerConfig<T extends QueueName> {
    name: string;
    queue: T;
    batchSize: number;
    intervalMs: number;
    publisher: QueuePublisher;
}
export declare abstract class BatchWorker<T extends QueueName> {
    protected readonly config: BatchWorkerConfig<T>;
    protected timer: NodeJS.Timeout | null;
    protected running: boolean;
    protected paused: boolean;
    protected metrics: {
        ticks: number;
        published: number;
        errors: number;
    };
    constructor(config: BatchWorkerConfig<T>);
    protected abstract fetchBatch(): Promise<QueuePayloadMap[T][]>;
    start(): Promise<void>;
    stop(): Promise<void>;
    pause(): Promise<void>;
    resume(): Promise<void>;
    tickNow(): Promise<void>;
    isPaused(): boolean;
    private tick;
    getMetrics(): typeof this.metrics;
}
