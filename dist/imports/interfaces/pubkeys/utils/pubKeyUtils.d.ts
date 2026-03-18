import type { SigLike, AddressLike } from './imports.js';
import { PublicKey } from './imports.js';
export type Base58String = string;
export type PubkeyInput = PublicKey | Base58String;
export type SignatureInput = SigLike | Base58String;
declare class KeyManager {
    private pubkeyCache;
    private signatureCache;
    isPubkey(v: unknown): v is PublicKey;
    isValidBase58(v: unknown): v is string;
    getPubkey(input: AddressLike): PublicKey;
    getPubkeyString(input: AddressLike): AddressLike;
    getSignature(input: SigLike): SigLike;
    getSignatureString(input: SigLike): SigLike;
    normalizeBase58(input: unknown): AddressLike;
    clear(): void;
}
export declare const keyManager: KeyManager;
export declare const isPubkey: (v: unknown) => v is PublicKey;
export declare const getPubkey: (v: AddressLike) => PublicKey;
export declare const getPubkeyString: (v: AddressLike) => AddressLike;
export declare const getSignature: (v: SigLike) => SigLike;
export declare const getSignatureString: (v: SigLike) => SigLike;
export declare const getBase58: (v: unknown) => AddressLike;
export {};
