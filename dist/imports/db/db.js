import { getDbApp, createDbClient, initializeSchema } from "@db";
import { createLogDataService, createLogDataRepository, LogDataRepository, LogDataService } from '@repositories/logdata/index.js';
import { createLogPayloadService, createLogPayloadRepository, LogPayloadRepository, LogPayloadService } from '@repositories/payloads/index.js';
import { createMetaDataService, MetaDataService, createMetaDataRepository, MetaDataRepository } from '@repositories/metadata/index.js';
import { createPairsService, PairsService, createPairsRepository, PairsRepository, } from '@repositories/pairs/index.js';
import { createTransactionsRepository, createTransactionsService, TransactionsRepository, TransactionsService } from '@repositories/transactions/index.js';
import { createSignaturesService, createSignaturesRepository, SignaturesRepository, SignaturesService } from '@repositories/signatures/index.js';
import { createLogOrchestrator, LogOrchestrator } from "@repositories/workflows/logData/LogOrchestrator.js";
import { RateLimiterService, createRateLimiterService } from '@repositories/ratelimiter/index.js';
import { getRateLimiterUrls } from './../envs/index.js';
import { getPublisher } from "@Pipeline/src/transport/publisher.js";
import { DECODER_REGISTRY } from './../decoding/index.js';
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
let _db;
let _repos;
let _services;
let _orchids = null;
let _app;
/* -------------------------------------------------- */
/* Lazy container                                     */
/* -------------------------------------------------- */
export const getRepoServices = {
    /* ---------------- DB ---------------- */
    db() {
        if (_db)
            return _db;
        _db = createDbClient();
        return _db;
    },
    /* ---------------- App ---------------- */
    async app() {
        if (_app)
            return _app;
        await initializeSchema();
        this.db();
        _app = await getDbApp();
        return _app;
    },
    /* ---------------- Repositories ---------------- */
    async repos() {
        if (_repos)
            return _repos;
        const db = this.db();
        const limiterDb = { db, ...getRateLimiterUrls() };
        _repos = {
            rateLimiter: await createRateLimiterService(limiterDb),
            logPayloadRepo: createLogPayloadRepository(db),
            logDataRepo: createLogDataRepository(db),
            metaDataRepo: createMetaDataRepository(db),
            pairsRepo: createPairsRepository(db),
            transactionsRepo: createTransactionsRepository(db),
            signaturesRepo: createSignaturesRepository(db),
        };
        return _repos;
    },
    /* ---------------- Services ---------------- */
    async services() {
        if (_services)
            return _services;
        const app = await this.app();
        _services = {
            logPayloadService: createLogPayloadService(app),
            transactionsService: createTransactionsService(app),
            logDataService: createLogDataService(app),
            metaDataService: createMetaDataService(app),
            pairsService: createPairsService(app),
            signaturesService: createSignaturesService(app),
            // getPublisher() is NOT called here — only when orchestrator first publishes
            logOrchestrator: createLogOrchestrator(app, makeLazyPublisher()),
        };
        return _services;
    },
    async orchistrators() {
        if (_orchids)
            return _orchids;
        const app = await this.app();
        _orchids = {};
        return _orchids;
    },
    /* ---------------- Cleanup ---------------- */
    async shutdown() {
        if (_app?.shutdown) {
            await _app.shutdown();
        }
        _db = _repos = _services = _app = null;
    },
};
/* -------------------------------------------------- */
/* Synchronous access after explicit boot             */
/* -------------------------------------------------- */
let _deps = null;
/**
 * Call once at application startup (e.g. main.ts).
 * Throws if called again — boot is not idempotent by accident.
 */
export async function initDeps(overrides) {
    if (_deps)
        throw new Error("initDeps() already called — deps are a singleton");
    const [repos, services] = await Promise.all([
        getRepoServices.repos(),
        getRepoServices.services(),
    ]);
    _deps = {
        pairsRepo: repos.pairsRepo,
        metaDataRepo: repos.metaDataRepo,
        transactionsRepo: repos.transactionsRepo,
        logPayloadRepo: repos.logPayloadRepo,
        logDataRepo: repos.logDataRepo,
        signaturesRepo: repos.signaturesRepo,
        rateLimiter: repos.rateLimiter,
        logPayloadService: services.logPayloadService,
        signaturesService: services.signaturesService,
        pairsService: services.pairsService,
        metaDataService: services.metaDataService,
        transactionsService: services.transactionsService,
        logDataService: services.logDataService,
        logOrchestrator: services.logOrchestrator,
        publisher: makeLazyPublisher(),
        decoderRegistry: DECODER_REGISTRY, // sync, no wrapper needed
        ...overrides,
    };
    return _deps;
}
export function getDeps(input = true) {
    const isOverride = input !== null && typeof input === 'object';
    const overrides = isOverride ? input : undefined;
    if (overrides) {
        const merged = { ...(_deps ?? {}), ...overrides };
        return Promise.resolve(merged);
    }
    if (input !== false) {
        return _deps ? Promise.resolve(_deps) : initDeps();
    }
    if (!_deps)
        throw new Error("getDeps() called before initDeps() resolved");
    return _deps;
}
/**
 * Reset for tests. Not for production.
 */
export function _resetDeps() {
    _deps = null;
}
