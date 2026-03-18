import type { EnrichmentContext } from '@imports';
import type { EnrichmentDeps } from './../db.js';
type Enricher<C extends EnrichmentContext = EnrichmentContext> = (ctx: C, deps: EnrichmentDeps) => Promise<C>;
export declare function safeEnrich<C extends EnrichmentContext>(name: string, fn: Enricher<C>): Enricher<C>;
export {};
