export function safeEnrich(name, fn) {
    return async (ctx, deps) => {
        try {
            return await fn(ctx, deps);
        }
        catch (err) {
            console.error({
                logType: 'enricher_error',
                enricher: name,
                mint: ctx.mint,
                pair_id: ctx.pair_id,
                error: err instanceof Error ? err.message : String(err),
            });
            return ctx;
        }
    };
}
