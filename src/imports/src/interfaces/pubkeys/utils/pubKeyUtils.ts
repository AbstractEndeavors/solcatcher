// key-manager/KeyManager.ts
import type {SigLike,AddressLike} from './imports.js';
import {isSignature,normalizeSignature,PublicKey,bs58} from './imports.js';
export type Base58String = string;

export type PubkeyInput =
  | PublicKey
  | Base58String;

export type SignatureInput =
  | SigLike
  | Base58String;

/* ============================================================================
 * KEY MANAGER
 * ========================================================================== */

class KeyManager {
  private pubkeyCache = new Map<string, PublicKey>();
  private signatureCache = new Map<string, SigLike>();

  /* ------------------------------
   * Guards
   * ------------------------------ */

  isPubkey(v: unknown): v is PublicKey {
    return v instanceof PublicKey;
  }



  isValidBase58(v: unknown): v is string {
    if (typeof v !== "string") return false;
    try {
      bs58.decode(v);
      return true;
    } catch {
      return false;
    }
  }

  /* ------------------------------
   * PUBLIC KEYS
   * ------------------------------ */

  getPubkey(input: AddressLike): PublicKey {
    if (this.isPubkey(input)) return input;

    if (!this.isValidBase58(input)) {
      throw new Error(`Invalid base58 pubkey: ${String(input)}`);
    }

    const cached = this.pubkeyCache.get(input);
    if (cached) return cached;

    const pk = new PublicKey(input);
    this.pubkeyCache.set(input, pk);
    return pk;
  }

  getPubkeyString(input: AddressLike): AddressLike {
    return this.getPubkey(input).toBase58();
  }
  /* ------------------------------
   * SIGNATURES
   * ------------------------------ */

  getSignature(input: SigLike): SigLike {
    if (isSignature(input)) return input;

    if (!this.isValidBase58(input)) {
      throw new Error(`Invalid base58 signature: ${String(input)}`);
    }

    const cached = this.signatureCache.get(input);
    if (cached) return cached;

    const sig = normalizeSignature(input);
    this.signatureCache.set(input, sig);
    return sig;
  }

  getSignatureString(input: SigLike): SigLike {
    return this.getSignature(input);
  }


  /* ------------------------------
   * GENERIC BASE58
   * ------------------------------ */

  normalizeBase58(input: unknown): AddressLike {
    if (this.isPubkey(input)) return input.toBase58();
    if (isSignature(input)) return normalizeSignature(input);

    if (!this.isValidBase58(input)) {
      throw new Error(`Invalid base58 value: ${String(input)}`);
    }

    return input;
  }

  /* ------------------------------
   * MAINTENANCE
   * ------------------------------ */

  clear(): void {
    this.pubkeyCache.clear();
    this.signatureCache.clear();
  }
}

/* ============================================================================
 * SINGLETON
 * ========================================================================== */

export const keyManager = new KeyManager();



/* ============================================================================
 * FUNCTIONAL WRAPPERS (OPTIONAL)
 * ========================================================================== */



export const isPubkey = (v: unknown): v is PublicKey =>
  keyManager.isPubkey(v);


export const getPubkey = (v: AddressLike): PublicKey =>
  keyManager.getPubkey(v);

export const getPubkeyString = (v: AddressLike): AddressLike =>
  keyManager.getPubkeyString(v);

export const getSignature = (v: SigLike): SigLike =>
    normalizeSignature(v);

export const getSignatureString = (v: SigLike): SigLike =>
  keyManager.getSignatureString(v);

export const getBase58 = (v: unknown): AddressLike =>
  keyManager.normalizeBase58(v);

