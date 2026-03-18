import {logger} from './../../module_imports.js';
// Minimal context helpers that work with your existing @logger.
// If you use abstract_logger, keep it—this just standardizes fields.
export type LogContext = {
  op: string;                 // e.g. "transactions.insertCurve"
  signature?: string;         // canonical correlation id
  queryKey?: string;          // QueryRegistry key
  rows?: number;              // rows returned/affected
  ms?: number;                // duration
  attempt?: number;           // retry # if you add retries
  note?: string;              // conflict, cache-hit, etc.
  [k: string]: unknown;
};

export function withCtx(base: LogContext, extra?: Partial<LogContext>): LogContext {
  return { ...base, ...(extra ?? {}) };
}

export function redacted<T extends object>(o: T, fields: string[] = []): T {
  const clone: any = { ...o };
  for (const f of fields) if (f in clone) clone[f] = '[redacted]';
  return clone;
}
export interface Queryable {
  query<T = any>(text: string, params?: any[]): Promise<{ rows: T[]; rowCount?: number }>;
}

export class InstrumentedClient implements Queryable {
  constructor(private readonly inner: Queryable) {}

  async query<T = any>(text: string, params?: any[], meta?: { op?: string; queryKey?: string; signature?: string }) {
    const start = performance.now();
    try {
      const res = await this.inner.query<T>(text, params);
      const ms = +(performance.now() - start).toFixed(1);
      logger.info(
        withCtx(
          { op: meta?.op ?? 'db.query', queryKey: meta?.queryKey, signature: meta?.signature, rows: res.rowCount ?? res.rows.length, ms },
          {}
        ),
        'DB query ok'
      );
      return res;
    } catch (err: any) {
      const ms = +(performance.now() - start).toFixed(1);
      logger.error(
        withCtx(
          { op: meta?.op ?? 'db.query', queryKey: meta?.queryKey, signature: meta?.signature, ms, error: err?.message, code: err?.code },
          {}
        ),
        'DB query error'
      );
      throw err;
    }
  }
}
