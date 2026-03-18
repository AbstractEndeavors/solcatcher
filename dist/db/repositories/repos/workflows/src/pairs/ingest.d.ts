import { LogOrchestrator } from './../LogOrchestrator.js';
import type { PairRow, PairsIngestResult, PairsIngestParams } from '@imports';
export declare function getPairData(this: LogOrchestrator, params: PairsIngestParams): Promise<PairRow | null>;
/**
 * Main orchestrator - composes all sections
 */
export declare function ingest(this: LogOrchestrator, params: PairsIngestParams): Promise<PairsIngestResult>;
