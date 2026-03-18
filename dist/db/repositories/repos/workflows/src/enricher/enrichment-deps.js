/**
 * ENRICHMENT DEPS
 *
 * Explicit dependency bag for enrichment functions.
 *
 * Before: every enricher called getRepoServices.repos() / .services()
 *         internally — hidden globals, untestable, untraceable.
 *
 * After:  the orchestrator builds EnrichmentDeps once and threads it
 *         through every enricher call. Same repos, no magic.
 *
 * Pattern: Explicit environment wiring over "smart defaults"
 */
import {} from "@db";
import { createLogDataService, createLogDataRepository, LogDataRepository, LogDataService } from '@repositories/logdata/index.js';
import { createLogPayloadService, createLogPayloadRepository, LogPayloadRepository, LogPayloadService } from '@repositories/payloads/index.js';
import { createMetaDataService, MetaDataService, createMetaDataRepository, MetaDataRepository } from '@repositories/metadata/index.js';
import { createPairsService, PairsService, createPairsRepository, PairsRepository, } from '@repositories/pairs/index.js';
import { createTransactionsRepository, createTransactionsService, TransactionsRepository, TransactionsService } from '@repositories/transactions/index.js';
import { createSignaturesService, createSignaturesRepository, SignaturesRepository, SignaturesService } from '@repositories/signatures/index.js';
import { RateLimiterService, createRateLimiterService } from '@repositories/ratelimiter/index.js';
import { createLogOrchestrator, LogOrchestrator } from "@repositories/workflows/LogOrchestrator.js";
import { getPublisher } from "@Pipeline/src/transport/publisher.js";
/* -------------------------------------------------- */
/* Lazy publisher proxy                               */
/*                                                    */
/* Defers getPublisher() to the moment publish() is   */
/* actually called — not when services() runs.        */
/* Eliminates boot-order coupling entirely.           */
/* -------------------------------------------------- */
export function makeLazyPublisher() {
    return {
        publish: (queue, payload) => getPublisher().publish(queue, payload),
        publishBatch: (queue, payloads) => getPublisher().publishBatch(queue, payloads),
    };
}
let db;
let repos;
let services;
let orchids = null;
let app;
export { createLogDataService, createLogDataRepository, createLogPayloadService, createLogPayloadRepository, createPairsRepository, createTransactionsRepository, createTransactionsService, createSignaturesService, createSignaturesRepository, createRateLimiterService, createMetaDataRepository, createMetaDataService, createPairsService };
