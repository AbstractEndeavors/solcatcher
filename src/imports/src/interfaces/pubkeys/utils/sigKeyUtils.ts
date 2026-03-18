import  {bs58} from  "./imports.js";
import type { TransactionSignature } from  "./../types.js";

/**
 * Check if value is a valid Solana transaction signature
 */
export function isSigkey(obj: unknown): obj is TransactionSignature {
  if (typeof obj !== "string") return false;

  try {
    const decoded = bs58.decode(obj);
    return decoded.length === 64; // ed25519 signature length
  } catch {
    return false;
  }
}

/**
 * Normalize input to TransactionSignature
 */
export function getSigkey(obj: unknown): TransactionSignature {
  if (isSigkey(obj)) return obj;
  throw new Error("Invalid Solana transaction signature");
}