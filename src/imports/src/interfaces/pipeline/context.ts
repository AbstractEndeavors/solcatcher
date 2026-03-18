// src/pipeline/context.ts

import type { IdLike, SigLike, AddressLike, MintLike, IntLike,StringLike } from '@imports';

/**
 * Immutable pipeline context.
 * Built progressively, never mutated.
 */
export interface PipelineContext {
  // From log ingestion (always present)
  readonly log_id: IdLike;
  readonly signature: SigLike;
  readonly slot: IntLike;
  readonly program_id: AddressLike;

  // From payload iteration (present after decode)
  readonly discrtiminator?: StringLike;
  readonly invocation?: IntLike;
  readonly mint?: MintLike;

  // From resolution (present after pair/meta lookup)
  readonly pair_id?: IdLike;
  readonly meta_id?: IdLike;
  readonly txn_id?: IdLike;
}

/**
 * Builder for immutable context.
 * Each method returns a new context.
 */
export function withInvocation(
  ctx: PipelineContext,
  invocation: IntLike,
  mint: MintLike
): PipelineContext {
  return { ...ctx, invocation, mint };
}

export function withPairId(ctx: PipelineContext, pair_id: IdLike): PipelineContext {
  return { ...ctx, pair_id };
}

export function withMetaId(ctx: PipelineContext, meta_id: IdLike): PipelineContext {
  return { ...ctx, meta_id };
}

export function withTxnId(ctx: PipelineContext, txn_id: IdLike): PipelineContext {
  return { ...ctx, txn_id };
}
