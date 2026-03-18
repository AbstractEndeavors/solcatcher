import { type EnrichedCreateEvent } from './imports.js';
import type { InsertPairParams, PairRow } from './schemas.js';
/**
 * Convert enriched create event to DB-ready insert params.
 * All bigints → strings for NUMERIC columns.
 */
export declare function toInsertPairParams(enriched: EnrichedCreateEvent): InsertPairParams;
/**
 * Check if pair needs volume refresh
 */
export declare function needsVolumeRefresh(pair: PairRow): Promise<boolean>;
