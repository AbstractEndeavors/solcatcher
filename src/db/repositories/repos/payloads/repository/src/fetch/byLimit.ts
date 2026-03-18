 
import {
  type LimitLike,
  normalizeFetchByLimitInput,
  normalizeLimit,
  LogPayloadRepository,
  QueryRegistry,
  type LogPayloadRow
} from './imports.js';
 export async function  fetchByLimit(
    this: LogPayloadRepository,
    a?: unknown,
    b?: unknown
  ): Promise<LogPayloadRow[]> {
    const { limit, latest } = normalizeFetchByLimitInput(a, b);

    return latest
      ? this.fetchByLimitLatest(limit)
      : this.fetchByLimitOldest(limit);
  }

 export async function fetchByLimitOldest(
  this: LogPayloadRepository,
  limit?: LimitLike
): Promise<LogPayloadRow[]> {
    const lim = normalizeLimit(limit);

    const result = await this.db.query<LogPayloadRow>(
      lim != null
        ? QueryRegistry.FETCH_BY_LIMIT_OLDEST
        : QueryRegistry.FETCH_OLDEST_NO_LIMIT,
      lim != null ? [lim] : []
    );

    return result.rows.map(r => this.rowToModel(r));
  }

 export async function fetchByLimitLatest(
  this: LogPayloadRepository,
  limit?: LimitLike
): Promise<LogPayloadRow[]> {
    const lim = normalizeLimit(limit);

    const result = await this.db.query<LogPayloadRow>(
      lim != null
        ? QueryRegistry.FETCH_BY_LIMIT_LATEST
        : QueryRegistry.FETCH_LATEST_NO_LIMIT,
      lim != null ? [lim] : []
    );

    return result.rows.map(r => this.rowToModel(r));
  }
