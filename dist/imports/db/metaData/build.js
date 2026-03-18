import {} from '@imports';
export function buildEnrichOnchainParams(result) {
    const isWrapped = result.metadata !== undefined;
    const meta = isWrapped
        ? (result.metadata ?? {})
        : result;
    const spl = result.spl ?? null;
    const rawStandard = meta.tokenStandard;
    const token_standard = rawStandard == null ? null
        : typeof rawStandard === 'object' ? (rawStandard.__option ?? null)
            : rawStandard;
    return {
        metadata_pda: meta.publicKey ?? null,
        update_authority: meta.updateAuthority ?? null,
        token_standard,
        is_mutable: meta.isMutable ?? null,
        onchain_metadata: meta,
        spl_metadata: spl,
    };
}
export function buildEnrichOffchainParams(offchain) {
    return {
        offchain_metadata: offchain, // blob is source of truth
    };
}
