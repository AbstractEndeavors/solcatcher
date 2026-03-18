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
export {};
