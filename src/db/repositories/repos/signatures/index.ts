/**
 * SIGNATURES PIPELINE
 * 
 * Clean, maintainable TypeScript architecture for signature tracking.
 */

// ============================================================
// CORE EXPORTS
// ============================================================

export { SignaturesService, createSignaturesService } from './service.js';
export { SignaturesRepository, createSignaturesRepository } from './repository/index.js';


// ============================================================
// SCHEMAS
// ============================================================



// ============================================================
// REGISTRIES
// ============================================================

export { QueryRegistry } from './query-registry.js';

// ============================================================
// TYPES
// ============================================================

export type { DatabaseClient } from './../types.js';
export type { SignaturesServiceConfig } from '@imports';
