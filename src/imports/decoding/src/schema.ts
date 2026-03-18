/**
 * Schema types for decoder system.
 * Matches Python dataclass equivalents.
 */

export interface DecodeError {
  signature: string | null;
  programId: string | null;
  discriminator: string;
  payloadLen: number;
  reason: string;
  b64: string;
}

export function createDecodeError(params: {
  signature?: string | null;
  programId?: string | null;
  discriminator: string;
  payloadLen: number;
  reason: string;
  b64: string;
}): DecodeError {
  return {
    signature: params.signature ?? null,
    programId: params.programId ?? null,
    discriminator: params.discriminator,
    payloadLen: params.payloadLen,
    reason: params.reason,
    b64: params.b64,
  };
}
