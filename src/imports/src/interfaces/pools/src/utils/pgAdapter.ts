// src/imports/interfaces/pools/src/utils/pgAdapter.ts
import type { Pool } from 'pg';
import type { PoolLike, PoolClientLike, QueryResultRow, QueryResult } from '../types.js';

export function adaptPgPool(pool: Pool): PoolLike {
  return {
    query<T extends QueryResultRow = any>(
      sql: string,
      params?: any[]
    ): Promise<QueryResult<T>> {
      // force the typed overload
      return pool.query<T>(sql, params);
    },

    async connect(): Promise<PoolClientLike> {
      const client = await pool.connect();
      return {
        query: client.query.bind(client),
        release: client.release.bind(client),
      };
    },

    end(): Promise<void> {
      return pool.end();
    },
  };
}
