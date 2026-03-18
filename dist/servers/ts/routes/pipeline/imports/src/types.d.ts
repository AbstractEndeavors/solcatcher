import type { QueueName } from './../../../../../../pipeline/src/queues/definitions.js';
export declare const MAX_LOGS = 1000;
export declare const logs: LogEntry[];
export interface LogEntry {
    id: string;
    timestamp: Date;
    level: 'debug' | 'info' | 'warn' | 'error' | 'success';
    message: string;
    details?: Record<string, unknown>;
    queue?: string;
}
export interface OHLCRouteContext {
    params?: {
        pair_id?: string;
    };
}
export declare const wsClients: Set<WebSocket>;
export interface PipelineState {
    status: 'running' | 'paused' | 'stopped';
    startTime: number;
    consumers: Map<QueueName, any>;
    workers: Map<QueueName, any>;
    consumerStatus: Map<QueueName, 'running' | 'paused' | 'stopped'>;
    workerStatus: Map<QueueName, 'running' | 'paused' | 'stopped'>;
}
export type { QueueName };
