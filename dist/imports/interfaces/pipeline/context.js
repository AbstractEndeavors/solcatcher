// src/pipeline/context.ts
/**
 * Builder for immutable context.
 * Each method returns a new context.
 */
export function withInvocation(ctx, invocation, mint) {
    return { ...ctx, invocation, mint };
}
export function withPairId(ctx, pair_id) {
    return { ...ctx, pair_id };
}
export function withMetaId(ctx, meta_id) {
    return { ...ctx, meta_id };
}
export function withTxnId(ctx, txn_id) {
    return { ...ctx, txn_id };
}
