
import {
  LogPayloadRepository,
  QueryRegistry,
  normalizeFetchByDiscriminatorInput,
  normalizeLimit
} from './imports.js';
import type {
  LimitLike,
  StringLike,
  LogPayloadRow
} from './imports.js';

 export async function  fetchByDiscriminator(
    this: LogPayloadRepository,
    a?: unknown,
    b?: unknown,
    c?:unknown,
  ): Promise<LogPayloadRow[]> {
    const { discriminator ,limit, latest} = normalizeFetchByDiscriminatorInput(a, b, c);

    return latest
      ? this.fetchByDiscriminatorLatest(discriminator,limit)
      : this.fetchByDiscriminatorOldest(discriminator,limit);
  }

 export async function fetchByDiscriminatorOldest(
  this: LogPayloadRepository,
  discriminator: StringLike, 
  limit?: LimitLike
): Promise<LogPayloadRow[]> {
    const lim = normalizeLimit(limit);

    const result = await this.db.query<LogPayloadRow>(
      lim != null
        ? QueryRegistry.FETCH_BY_DISCRIMINATOR_OLDEST
        : QueryRegistry.FETCH_BY_DISCRIMINATOR_OLDEST_NO_LIMIT,
      lim != null ? [discriminator,lim] : [discriminator]
    );

    return result.rows.map(r => this.rowToModel(r));
  }

 export async function fetchByDiscriminatorLatest(
  this: LogPayloadRepository,
  discriminator: StringLike, 
  limit?: LimitLike
): Promise<LogPayloadRow[]> {
    const lim = normalizeLimit(limit);

    const result = await this.db.query<LogPayloadRow>(
      lim != null
        ? QueryRegistry.FETCH_BY_DISCRIMINATOR_LATEST
        : QueryRegistry.FETCH_BY_DISCRIMINATOR_LATEST_NO_LIMIT,
      lim != null ? [discriminator,lim] : [discriminator,]
    );

    return result.rows.map((r:LogPayloadRow) => this.rowToModel(r));
  }
