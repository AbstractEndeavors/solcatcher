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
export declare function createDecodeError(params: {
    signature?: string | null;
    programId?: string | null;
    discriminator: string;
    payloadLen: number;
    reason: string;
    b64: string;
}): DecodeError;
