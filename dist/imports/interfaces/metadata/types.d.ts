import type { AddressLike, IntLike, BoolLike, DateLike, Identity } from './imports.js';
export interface DecodedData {
    mint: AddressLike;
    name?: string;
    symbol?: string;
    uri?: string;
    decimals?: IntLike;
    mintAuthority?: AddressLike;
    freezeAuthority?: AddressLike;
    isMutable?: BoolLike;
    primarySaleHappened?: BoolLike;
    description?: string;
    discriminator?: string;
    metadata?: {
        publicKey?: AddressLike;
        header?: any;
        key?: IntLike;
        updateAuthority?: AddressLike;
    };
}
export interface IPFSData {
    image?: string;
    website?: string;
    twitter?: string;
    description?: string;
    creation_date?: DateLike;
}
export interface ProcessedMetaData {
    mint: AddressLike;
    name?: string;
    symbol?: string;
    uri?: string;
    decimals: IntLike;
    image?: string;
    mintAuthority?: string;
    freezeAuthority?: string;
    twitter?: string;
    website?: string;
    isMutable: BoolLike;
    primarySaleHappened: BoolLike;
    description?: string;
    meta_data: any;
    creation_date: DateLike;
    discriminator: string;
    processed: BoolLike;
}
export interface TokenMetadata {
    mint?: AddressLike;
    discriminator?: string;
    name?: string;
    symbol?: string;
    uri?: string;
    decimals?: IntLike;
    image?: string;
    mintAuthority?: AddressLike;
    freezeAuthority?: AddressLike;
    twitter?: string;
    website?: string;
    isMutable?: BoolLike;
    primarySaleHappened?: BoolLike;
    description?: string;
    meta_data?: any;
    creation_date?: DateLike;
    tokeninfo?: any;
    processed?: BoolLike;
}
export interface MetaDataIdentityParams extends Identity {
    bonding_curve?: AddressLike;
    program_id?: AddressLike;
}
