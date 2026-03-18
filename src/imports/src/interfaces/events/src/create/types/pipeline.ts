// src/imports/interfaces/events/create/types.ts

import type {
  InsertPairParams
} from './imports.js';
import type {EnrichedCreateEvent,CreateEnrichmentContext} from './enrich.js'
import type {DecodedCreateEvents} from './decode.js';
// =============================================================================
// PIPELINE
// =============================================================================

export interface CreatePipelineContext extends CreateEnrichmentContext {}

export interface CreatePipelineResult {
  decoded: DecodedCreateEvents;
  enriched: EnrichedCreateEvent;
  insertParams: InsertPairParams;
  result?: any;
}