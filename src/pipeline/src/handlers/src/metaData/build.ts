import {
  type OnchainMetadataPayload,
  type EnrichOnchainParams,
  type ChainFetchResult,
  type OffchainFetchResult,
  type EnrichOffchainParams,
} from '@imports';


export function buildEnrichOnchainParams(
  result: OnchainMetadataPayload | ChainFetchResult
): EnrichOnchainParams {
  const isWrapped = (result as ChainFetchResult).metadata !== undefined;
  const meta: OnchainMetadataPayload = isWrapped
    ? ((result as ChainFetchResult).metadata ?? {})
    : (result as OnchainMetadataPayload);
  const spl = (result as ChainFetchResult).spl ?? null;

  const rawStandard = meta.tokenStandard;
  const token_standard =
    rawStandard == null             ? null
    : typeof rawStandard === 'object' ? ((rawStandard as any).__option ?? null)
    : rawStandard;

  return {
    metadata_pda:     meta.publicKey       ?? null,
    update_authority: meta.updateAuthority ?? null,
    token_standard,
    is_mutable:       meta.isMutable       ?? null,
    onchain_metadata: meta,
    spl_metadata:     spl,
  };
}

export function buildEnrichOffchainParams(
  offchain: OffchainFetchResult
): EnrichOffchainParams {
  return {
    offchain_metadata: offchain,  // blob is source of truth
  };
}


