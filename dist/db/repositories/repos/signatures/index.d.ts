/**
 * SIGNATURES PIPELINE
 *
 * Clean, maintainable TypeScript architecture for signature tracking.
 */
export { SignaturesService, createSignaturesService } from './service.js';
export { SignaturesRepository, createSignaturesRepository } from './repository/index.js';
export { QueryRegistry } from './query-registry.js';
export type { DatabaseClient } from './../types.js';
export type { SignaturesServiceConfig } from '@imports';
