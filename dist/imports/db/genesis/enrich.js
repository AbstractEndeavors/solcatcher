import { isSignature } from '@imports';
import {} from './../db.js';
import { fetchTransaction } from '@rateLimiter';
import { transformSolanaTransaction } from '@imports';
// ============================================================
// GENESIS SIGNATURE
// Cross-fill from pair↔meta, then defer to genesisLookup queue
// if neither side has it (signaturesService lives there now).
// ============================================================
export async function enrichGenesis(ctx, _deps) {
    if (ctx.pair.signature && ctx.meta.signature)
        return ctx;
    if (ctx.pair.signature && !ctx.meta.signature) {
        ctx.meta.signature = ctx.pair.signature;
        ctx.enrich_fields.meta.push('signature');
        return ctx;
    }
    if (ctx.meta.signature && !ctx.pair.signature) {
        ctx.pair.signature = ctx.meta.signature;
        ctx.enrich_fields.pair.push('signature');
        return ctx;
    }
    // Neither side has it — genesisLookup handler owns the signature search.
    // Emit to queue rather than inline here so signaturesService
    // stays out of EnrichmentDeps entirely.
    if (_deps.publisher) {
        await _deps.publisher.publish('genesisLookup', {
            pair_id: ctx.pair_id,
            mint: ctx.mint,
            program_id: ctx.program_id,
        });
    }
    return ctx;
}
