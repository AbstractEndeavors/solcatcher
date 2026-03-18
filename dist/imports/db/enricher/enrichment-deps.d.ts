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
import type { PairsRepository } from '@repositories/pairs/repository/index.js';
import type { MetaDataRepository } from '@repositories/metadata/repository/index.js';
import type { TransactionsRepository } from '@repositories/transactions/repository/index.js';
import type { LogPayloadService } from '@repositories/payloads/index.js';
import type { LogDataService } from '@repositories/logdata/index.js';
import type { QueuePublisher } from '@imports';
export interface EnrichmentRepos {
    readonly pairsRepo: PairsRepository;
    readonly metaDataRepo: MetaDataRepository;
    readonly transactionsRepo: TransactionsRepository;
}
export interface EnrichmentDeps {
    readonly logData: LogDataService;
    readonly logPayloads: LogPayloadService;
    readonly publisher: QueuePublisher;
}
