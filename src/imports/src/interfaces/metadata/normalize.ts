export function normalizeChainMetadata(input: any) {
  const meta = input?.metadata ?? null;
  const off = input?.offchain ?? null;

  return {
    // ─────────────────────────────────────────
    // Identity
    // ─────────────────────────────────────────
    mint: input.mint,

    // 🔒 LOSSLESS SOURCE OF TRUTH
    raw_payload: input,

    // ─────────────────────────────────────────
    // Metaplex identity
    // ─────────────────────────────────────────
    metadata_pda: meta?.publicKey ?? null,
    update_authority: meta?.updateAuthority ?? null,

    // ─────────────────────────────────────────
    // Display (prefer on-chain, fallback off-chain)
    // ─────────────────────────────────────────
    name: meta?.name || off?.name || null,
    symbol: meta?.symbol || off?.symbol || null,
    uri: meta?.uri ?? null,

    // ─────────────────────────────────────────
    // Metaplex flags
    // ─────────────────────────────────────────
    seller_fee_basis_points: meta?.sellerFeeBasisPoints ?? null,
    is_mutable: meta?.isMutable ?? null,
    primary_sale_happened: meta?.primarySaleHappened ?? null,
    token_standard: meta?.tokenStandard?.__option ?? null,

    // ─────────────────────────────────────────
    // Off-chain projections
    // ─────────────────────────────────────────
    image: off?.image ?? null,
    description: off?.description ?? null,
    external_url: off?.external_url ?? null,

    // ─────────────────────────────────────────
    // Raw structured payloads
    // ─────────────────────────────────────────
    onchain_metadata: meta,
    offchain_metadata: off,
    spl_metadata: input?.spl ?? null,

    // ─────────────────────────────────────────
    // State
    // ─────────────────────────────────────────
    has_metadata: Boolean(input?.hasMetadata ?? meta),
  };
}
