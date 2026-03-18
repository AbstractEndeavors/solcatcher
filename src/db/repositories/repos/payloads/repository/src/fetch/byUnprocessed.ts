
import {
  LogPayloadRepository,
  QueryRegistry,
  normalizeFetchByLimitInput,
  normalizeLimit
} from './imports.js';
import type {LogPayloadRow,LimitLike} from './imports.js';
 export async function  fetchByUnprocessed(
    this: LogPayloadRepository,
    a?: unknown,
    b?: unknown
  ): Promise<LogPayloadRow[]> {
    const { limit, latest } = normalizeFetchByLimitInput(a, b);

    return latest
      ? this.fetchByUnprocessedLatest(limit)
      : this.fetchByUnprocessedOldest(limit);
  }

 export async function fetchByUnprocessedOldest(
  this: LogPayloadRepository,
  limit?: LimitLike
): Promise<LogPayloadRow[]> {
    const lim = normalizeLimit(limit);

    const result = await this.db.query<LogPayloadRow>(
      lim != null
        ? QueryRegistry.FETCH_UNPROCESSED_OLDEST
        : QueryRegistry.FETCH_UNPROCESSED_OLDEST_NO_LIMIT,
      lim != null ? [lim] : []
    );

    return result.rows.map(r => this.rowToModel(r));
  }

 export async function fetchByUnprocessedLatest(
  this: LogPayloadRepository,
  limit?: LimitLike
): Promise<LogPayloadRow[]> {
    const lim = normalizeLimit(limit);

    const result = await this.db.query<LogPayloadRow>(
      lim != null
        ? QueryRegistry.FETCH_UNPROCESSED_LATEST
        : QueryRegistry.FETCH_UNPROCESSED_LATEST_NO_LIMIT,
      lim != null ? [lim] : []
    );

    return result.rows.map(r => this.rowToModel(r));
  }
