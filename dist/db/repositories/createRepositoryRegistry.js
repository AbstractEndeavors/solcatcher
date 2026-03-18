import { MetaDataRepository } from "./repos/metadata/index.js";
import { PairsRepository } from "./repos/pairs/index.js";
import { TransactionsRepository } from "./repos/transactions/index.js";
import { LogDataRepository } from "./repos/logdata/index.js";
import { LogPayloadRepository } from "./repos/payloads/index.js";
import { SignaturesRepository } from "./repos/signatures/index.js";
import { RateLimiterRepository } from "./repos/ratelimiter/index.js";
export function createRepositoryRegistry(db) {
    return {
        pairs: new PairsRepository(db),
        transactions: new TransactionsRepository(db),
        logData: new LogDataRepository(db),
        logPayloads: new LogPayloadRepository(db),
        signatures: new SignaturesRepository(db),
        metaData: new MetaDataRepository(db),
        rateLimiter: new RateLimiterRepository(db)
    };
}
