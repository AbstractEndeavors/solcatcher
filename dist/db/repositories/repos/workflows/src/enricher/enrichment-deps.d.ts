import { createLogDataService, createLogDataRepository, LogDataRepository, LogDataService } from '@repositories/logdata/index.js';
import { createLogPayloadService, createLogPayloadRepository, LogPayloadRepository, LogPayloadService } from '@repositories/payloads/index.js';
import { createMetaDataService, MetaDataService, createMetaDataRepository, MetaDataRepository } from '@repositories/metadata/index.js';
import { createPairsService, PairsService, createPairsRepository, PairsRepository } from '@repositories/pairs/index.js';
import { createTransactionsRepository, createTransactionsService, TransactionsRepository, TransactionsService } from '@repositories/transactions/index.js';
import { createSignaturesService, createSignaturesRepository, SignaturesRepository, SignaturesService } from '@repositories/signatures/index.js';
import { RateLimiterService, createRateLimiterService } from '@repositories/ratelimiter/index.js';
import { LogOrchestrator } from "@repositories/workflows/LogOrchestrator.js";
import type { DecoderRegistry, QueuePublisher } from '@decoder';
export declare function makeLazyPublisher(): QueuePublisher;
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
export interface Publisher {
    publisher: QueuePublisher;
}
export interface RepoServiceDeps extends Repositories, Services {
}
export interface RepoServiceLimiterDeps extends RepoServiceDeps, Limiters {
}
export interface RepoServiceLimiterDecoderDeps extends RepoServiceLimiterDeps, Decoders {
}
export interface RepoServiceLimiterDecoderPublisherDeps extends RepoServiceLimiterDecoderDeps, Publisher {
}
export interface RepoServiceLimiterDecoderPublisherOrchistratorDeps extends RepoServiceLimiterDecoderPublisherDeps, Orchistrators {
}
export interface AllDeps extends Repositories, Services, Orchistrators, Limiters, Decoders {
}
export interface PipelineDeps extends Repositories, Services, Orchistrators, Limiters {
}
export interface OrchistratorDeps extends Repositories, Services, Limiters, Decoders {
}
export interface LogOrchestratorConfig extends Repositories, Services, Decoders, Publisher {
}
export interface EnrichmentRepos {
    readonly logDataRepository: LogDataRepository;
    readonly logPayloadRepository: LogPayloadRepository;
    readonly metaDataRepository: MetaDataRepository;
    readonly pairsRepository: PairsRepository;
    readonly transactionsRepository: TransactionsRepository;
}
export interface EnrichmentDeps {
    readonly logDataService: LogDataService;
    readonly logPayloadService: LogPayloadService;
    readonly metaDataService: MetaDataService;
    readonly pairsService: PairsService;
    readonly transactionsService: TransactionsService;
}
export { createLogDataService, createLogDataRepository, createLogPayloadService, createLogPayloadRepository, createPairsRepository, createTransactionsRepository, createTransactionsService, createSignaturesService, createSignaturesRepository, createRateLimiterService, createMetaDataRepository, createMetaDataService, createPairsService };
