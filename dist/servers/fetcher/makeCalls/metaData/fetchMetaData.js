//import {startSolcatcher} from './src';
//await startSolcatcher()
import { getPubkey } from "@putkoff/abstract-solana";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { mplTokenMetadata, fetchDigitalAsset, fetchMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { createSignerFromKeypair, generateSigner, signerIdentity, AccountNotFoundError, } from "@metaplex-foundation/umi";
import { logResponse, getUrl, getFallbackUrl } from "./../../../limiter/client.js";
const METADATA_RETRY_WINDOWS = [
    30_000, // first retry after 30s
    120_000, // then after 2m
    600_000, // then after 10m
];
export function shouldAttemptMetadataFetch(row) {
    if (row.has_metadata)
        return false;
    const now = Date.now();
    const age = now - row.created_at.getTime();
    const sinceUpdate = now - row.updated_at.getTime();
    return METADATA_RETRY_WINDOWS.some((window) => age >= window && sinceUpdate >= window);
}
/**
 * Registry for Umi instances
 * NO CONNECTION OBJECTS - uses only custom fetch
 */
export class UmiRegistry {
    async getUmi() {
        const method = "umi_init";
        const url = await getUrl(method);
        const umi = createUmi(url, {
            fetch: createRateLimitedFetch(),
        });
        umi.use(mplTokenMetadata());
        umi.use(signerIdentity(createSignerFromKeypair(umi, generateSigner(umi))));
        return umi;
    }
}
export function sanitizeForJson(value) {
    if (typeof value === "bigint")
        return value.toString();
    if (Array.isArray(value))
        return value.map(sanitizeForJson);
    if (value && typeof value === "object") {
        return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, sanitizeForJson(v)]));
    }
    return value;
}
export function createRateLimitedFetch() {
    return async (input, init) => {
        const method = extractMethodFromRequest(init);
        const url = await getUrl(method);
        const res = await fetch(url, init);
        if (res.status === 429) {
            const fallbackUrl = await getFallbackUrl();
            const fallbackRes = await fetch(fallbackUrl, init);
            return fallbackRes;
        }
        return res;
    };
}
export function extractMethodFromRequest(init) {
    if (!init?.body)
        return "default";
    try {
        const body = JSON.parse(init.body);
        return body.method ?? "default";
    }
    catch {
        return "default";
    }
}
export async function getUmiMetadata(mint) {
    const umiRegistry = new UmiRegistry();
    const umi = await umiRegistry.getUmi();
    return await fetchDigitalAsset(umi, getPubkey(mint));
}
export async function getFullTokenInfo(mint) {
    const umiRegistry = new UmiRegistry();
    const umi = await umiRegistry.getUmi();
    const raw = await fetchAllTokenInfo(umi, mint);
    return sanitizeForJson(raw); // ✔️ plain object
}
export async function getUmi(mint) {
    const method = 'getUmi';
    const url = await getUrl(method);
    const umi = await createUmi(url);
    umi.use(mplTokenMetadata());
    const keypair = generateSigner(umi);
    umi.use(signerIdentity(createSignerFromKeypair(umi, keypair)));
    const metaData = await fetchDigitalAsset(umi, getPubkey(mint));
    return metaData;
}
export async function fetchAllTokenInfo(umi, mint) {
    const mintPk = getPubkey(mint);
    /* ----------------------------
     * 2. Metaplex Metadata (OPTIONAL)
     * ---------------------------- */
    let metadataAccount = null;
    try {
        metadataAccount = await fetchMetadata(umi, mintPk);
    }
    catch (err) {
        if (!(err instanceof AccountNotFoundError)) {
            throw err; // real failure
        }
    }
    /* ----------------------------
     * 3. Off-chain JSON (OPTIONAL)
     * ---------------------------- */
    let offchain = null;
    if (metadataAccount?.uri) {
        try {
            const res = await fetch(metadataAccount.uri);
            if (res.ok) {
                offchain = await res.json();
            }
        }
        catch {
            /* ignore */
        }
    }
    return {
        mint,
        spl: mintPk,
        metadata: metadataAccount,
        offchain,
        hasMetadata: !!metadataAccount,
    };
}
