import type { MintLike } from '@imports';
export declare function shouldAttemptMetadataFetch(row: {
    created_at: Date;
    updated_at: Date;
    has_metadata: boolean;
}): boolean;
/**
 * Registry for Umi instances
 * NO CONNECTION OBJECTS - uses only custom fetch
 */
export declare class UmiRegistry {
    getUmi(): Promise<import("@metaplex-foundation/umi").Umi>;
}
export declare function sanitizeForJson(value: any): any;
export declare function createRateLimitedFetch(): (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
export declare function extractMethodFromRequest(init?: RequestInit): string;
export declare function getUmiMetadata(mint: MintLike): Promise<import("@metaplex-foundation/mpl-token-metadata").DigitalAsset>;
export declare function getFullTokenInfo(mint: MintLike): Promise<any>;
export declare function getUmi(mint: MintLike): Promise<any>;
export declare function fetchAllTokenInfo(umi: any, mint: MintLike): Promise<{
    mint: MintLike;
    spl: import("@imports").PublicKey;
    metadata: any;
    offchain: any;
    hasMetadata: boolean;
}>;
