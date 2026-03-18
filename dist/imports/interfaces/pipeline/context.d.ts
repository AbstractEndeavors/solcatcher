import type { IdLike, SigLike, AddressLike, MintLike, IntLike, StringLike } from '@imports';
/**
 * Immutable pipeline context.
 * Built progressively, never mutated.
 */
export interface PipelineContext {
    readonly log_id: IdLike;
    readonly signature: SigLike;
    readonly slot: IntLike;
    readonly program_id: AddressLike;
    readonly discrtiminator?: StringLike;
    readonly invocation?: IntLike;
    readonly mint?: MintLike;
    readonly pair_id?: IdLike;
    readonly meta_id?: IdLike;
    readonly txn_id?: IdLike;
}
/**
 * Builder for immutable context.
 * Each method returns a new context.
 */
export declare function withInvocation(ctx: PipelineContext, invocation: IntLike, mint: MintLike): PipelineContext;
export declare function withPairId(ctx: PipelineContext, pair_id: IdLike): PipelineContext;
export declare function withMetaId(ctx: PipelineContext, meta_id: IdLike): PipelineContext;
export declare function withTxnId(ctx: PipelineContext, txn_id: IdLike): PipelineContext;
