import {type PipelineState,type LogEntry,logs,MAX_LOGS,wsClients} from './../src/index.js'
// ────────────────────────────────────────────────────────
// STATE MANAGEMENT
// ────────────────────────────────────────────────────────
let pipelineState: PipelineState | null = null;

export function setPipelineState(state: PipelineState): void {
  pipelineState = state;
}

export function getPipelineState(): PipelineState | null {
  return pipelineState;
}

export function requirePipeline(req: any, res: any, next: any) {
  if (!pipelineState) {
    return res.status(503).json({ error: 'Pipeline not initialized' });
  }
  next();
}

// ────────────────────────────────────────────────────────
// HELPERS
// ────────────────────────────────────────────────────────

export function getFullStatus() {
  if (!pipelineState) return null;

  const queues: Record<string, any> = {};
  const workers: Record<string, any> = {};

  for (const [name, consumer] of pipelineState.consumers) {
    queues[name] = {
      status: pipelineState.consumerStatus.get(name) || 'stopped',
      metrics: consumer.getMetrics?.() || { processed: 0, failed: 0, retried: 0, dlq: 0 },
    };
  }

  for (const [name, worker] of pipelineState.workers) {
    workers[name] = {
      status: pipelineState.workerStatus.get(name) || 'stopped',
      metrics: worker.getMetrics?.() || { ticks: 0, published: 0, errors: 0 },
    };
  }

  return {
    status: pipelineState.status,
    uptime: Date.now() - pipelineState.startTime,
    queues,
    workers,
  };
}

export {pipelineState}
// ────────────────────────────────────────────────────────
// LOGS
// ────────────────────────────────────────────────────────

export function broadcast(message: { type: string; payload: any }): void {
  const data = JSON.stringify(message);
  for (const client of wsClients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  }
}

export function broadcastMetrics(): void {
  const status = getFullStatus();
  if (status) {
    broadcast({ type: 'metrics', payload: status });
  }
}

export function broadcastLog(entry: LogEntry): void {
  broadcast({ type: 'log', payload: entry });
}

export function broadcastClearLogs(): void {
  broadcast({ type: 'logs_cleared', payload: null });
}

export function captureLog(entry: Omit<LogEntry, 'id' | 'timestamp'>): void {
  const logEntry: LogEntry = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(),
    ...entry,
  };

  logs.unshift(logEntry);
  if (logs.length > MAX_LOGS) {
    logs.pop();
  }

  broadcastLog(logEntry);
}
