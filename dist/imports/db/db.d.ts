import { type DatabaseClient } from "@db";
import { createLogDataService, createLogDataRepository, LogDataRepository, LogDataService } from '@repositories/logdata/index.js';
import { createLogPayloadService, createLogPayloadRepository, LogPayloadRepository, LogPayloadService } from '@repositories/payloads/index.js';
import { createMetaDataService, MetaDataService, createMetaDataRepository, MetaDataRepository } from '@repositories/metadata/index.js';
import { createPairsService, PairsService, createPairsRepository, PairsRepository } from '@repositories/pairs/index.js';
import { createTransactionsRepository, createTransactionsService, TransactionsRepository, TransactionsService } from '@repositories/transactions/index.js';
import { createSignaturesService, createSignaturesRepository, SignaturesRepository, SignaturesService } from '@repositories/signatures/index.js';
import { createLogOrchestrator, LogOrchestrator } from "@repositories/workflows/logData/LogOrchestrator.js";
import { RateLimiterService, createRateLimiterService } from '@repositories/ratelimiter/index.js';
import type { DatabaseApp, DecoderRegistry, QueuePublisher } from '@imports';
export declare function makeLazyPublisher(): QueuePublisher;
export interface EnrichmentRepos {
    readonly pairsRepo: PairsRepository;
    readonly metaDataRepo: MetaDataRepository;
    readonly transactionsRepo: TransactionsRepository;
}
export interface EnrichmentDeps extends EnrichmentRepos {
    readonly logData: LogDataService;
    readonly logPayloads: LogPayloadService;
    readonly publisher: QueuePublisher;
}
export interface Repositories {
    pairsRepo: PairsRepository;
    metaDataRepo: MetaDataRepository;
    transactionsRepo: TransactionsRepository;
    logPayloadRepo: LogPayloadRepository;
    logDataRepo: LogDataRepository;
    signaturesRepo: SignaturesRepository;
}
export interface Services {
    logPayloadService: LogPayloadService;
    signaturesService: SignaturesService;
    pairsService: PairsService;
    metaDataService: MetaDataService;
    transactionsService: TransactionsService;
    logDataService: LogDataService;
}
export interface Orchistrators {
    logOrchestrator: LogOrchestrator;
}
export interface Limiters {
    rateLimiter: RateLimiterService;
}
export interface Decoders {
    decoderRegistry: DecoderRegistry;
}
export interface AllDeps extends Repositories, Services, Orchistrators, Limiters, Decoders {
    publisher: QueuePublisher;
}
export interface PipelineDeps extends Repositories, Services, Orchistrators, Limiters {
    publisher: QueuePublisher;
}
interface CreateServices {
    logPayloadService: ReturnType<typeof createLogPayloadService>;
    transactionsService: ReturnType<typeof createTransactionsService>;
    logDataService: ReturnType<typeof createLogDataService>;
    metaDataService: ReturnType<typeof createMetaDataService>;
    pairsService: ReturnType<typeof createPairsService>;
    signaturesService: ReturnType<typeof createSignaturesService>;
    logOrchestrator: ReturnType<typeof createLogOrchestrator>;
}
interface CreateRepositories {
    rateLimiter: Awaited<ReturnType<typeof createRateLimiterService>>;
    logPayloadRepo: ReturnType<typeof createLogPayloadRepository>;
    logDataRepo: ReturnType<typeof createLogDataRepository>;
    metaDataRepo: ReturnType<typeof createMetaDataRepository>;
    pairsRepo: ReturnType<typeof createPairsRepository>;
    transactionsRepo: ReturnType<typeof createTransactionsRepository>;
    signaturesRepo: ReturnType<typeof createSignaturesRepository>;
}
export declare const getRepoServices: {
    db(): DatabaseClient;
    app(): Promise<DatabaseApp>;
    repos(): Promise<CreateRepositories>;
    services(): Promise<CreateServices>;
    orchistrators(): Promise<any>;
    shutdown(): Promise<void>;
};
export interface AllDeps extends Repositories, Services, Orchistrators, Limiters {
    publisher: QueuePublisher;
}
/**
 * Call once at application startup (e.g. main.ts).
 * Throws if called again — boot is not idempotent by accident.
 */
export declare function initDeps(overrides?: Partial<AllDeps>): Promise<AllDeps>;
export declare function getDeps(input?: false): AllDeps;
export declare function getDeps(input?: true | null | Partial<AllDeps>): Promise<AllDeps>;
/**
 * Reset for tests. Not for production.
 */
export declare function _resetDeps(): void;
export {};
