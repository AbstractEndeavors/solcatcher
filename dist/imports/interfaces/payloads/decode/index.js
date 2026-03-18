/**
 * DECODE MODULE
 *
 * Self-contained decode pipeline for the payload repository layer.
 *
 * Exports:
 *   - Schemas: ClassifiedEvent, DecodedTradeEvent, DecodedCreateEvent, etc.
 *   - Classifier: classify(), classifyBatch() — pure functions
 *   - Pipeline: decodeBySignature(), decodeById() — repo-bound methods
 *   - IngestResult: extended context carrying decoded events
 *   - Guards: isTradeEvent(), isCreateEvent(), isUnknownEvent(), hasDecodedEvents()
 *   - Helpers: partitionEvents(), emptyIngestResult(), buildIngestResult()
 */
// Schemas + type guards + helpers
export * from './schemas.js';
// Ingest result (extended context)
export * from './ingest-result.js';
// Pure classifier
export * from './classifier.js';
