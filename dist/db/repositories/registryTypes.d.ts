import type { LogDataRepository } from "./repos/logdata/index.js";
import type { LogPayloadRepository } from "./repos/payloads/index.js";
import type { SignaturesRepository } from "./repos/signatures/index.js";
import type { MetaDataRepository } from "./repos/metadata/index.js";
import type { PairsRepository } from "./repos/pairs/index.js";
import type { TransactionsRepository } from "./repos/transactions/index.js";
import type { RateLimiterRepository } from "./repos/ratelimiter/index.js";
export interface MainObjectRepositoryRegistry {
}
export interface PipelineRepositoryRegistry {
    logData: LogDataRepository;
    logPayloads: LogPayloadRepository;
    signatures: SignaturesRepository;
    metaData: MetaDataRepository;
    rateLimiter: RateLimiterRepository;
    pairs: PairsRepository;
    transactions: TransactionsRepository;
}
export interface RepositoryRegistry extends MainObjectRepositoryRegistry, PipelineRepositoryRegistry {
}
