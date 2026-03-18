import type { FetchUnsortedLimitParams, LimitLike } from './imports.js';
import { isPositive } from './imports.js';
export declare const isLimit: typeof isPositive;
export declare function normalizeFetchByLimitInput(a?: unknown, b?: unknown): FetchUnsortedLimitParams;
export declare function normalizeLimit(limit?: LimitLike): number | null;
