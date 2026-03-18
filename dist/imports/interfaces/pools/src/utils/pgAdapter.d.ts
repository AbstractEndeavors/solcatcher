import type { Pool } from 'pg';
import type { PoolLike } from '../types.js';
export declare function adaptPgPool(pool: Pool): PoolLike;
