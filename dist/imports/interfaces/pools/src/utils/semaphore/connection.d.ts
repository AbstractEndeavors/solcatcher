import type { SemaphoreConfig, SemaphoreMetrics } from '../../types.js';
export declare class ConnectionSemaphore {
    private readonly config;
    private available;
    private queue;
    private metrics;
    constructor(config: SemaphoreConfig);
    acquire(): Promise<() => void>;
    getMetrics(): SemaphoreMetrics;
    private createReleaser;
    private release;
    private removeFromQueue;
    private recordAcquisition;
}
