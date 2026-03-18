import { type PipelineState, type LogEntry } from './../src/index.js';
declare let pipelineState: PipelineState | null;
export declare function setPipelineState(state: PipelineState): void;
export declare function getPipelineState(): PipelineState | null;
export declare function requirePipeline(req: any, res: any, next: any): any;
export declare function getFullStatus(): {
    status: "stopped" | "paused" | "running";
    uptime: number;
    queues: Record<string, any>;
    workers: Record<string, any>;
} | null;
export { pipelineState };
export declare function broadcast(message: {
    type: string;
    payload: any;
}): void;
export declare function broadcastMetrics(): void;
export declare function broadcastLog(entry: LogEntry): void;
export declare function broadcastClearLogs(): void;
export declare function captureLog(entry: Omit<LogEntry, 'id' | 'timestamp'>): void;
