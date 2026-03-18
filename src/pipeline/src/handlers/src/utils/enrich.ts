import type {EnrichmentContext} from '@imports';
import type {AllDeps} from '@db'
// ============================================================
// SAFE WRAPPER
// ============================================================

type Enricher<C extends EnrichmentContext = EnrichmentContext> = (
  ctx: C,
  deps: AllDeps
) => Promise<C>;

export function safeEnrich<C extends EnrichmentContext>(
  name: string,
  fn: Enricher<C>
): Enricher<C> {
  return async (ctx, deps) => {
    try {
      return await fn(ctx, deps);
    } catch (err) {
      console.error({
        logType:  'enricher_error',
        enricher: name,
        mint:     ctx.mint,
        pair_id:  ctx.pair_id,
        error:    err instanceof Error ? err.message : String(err),
      });
      return ctx;
    }
  };
}

