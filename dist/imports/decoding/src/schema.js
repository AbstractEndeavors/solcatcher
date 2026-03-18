/**
 * Schema types for decoder system.
 * Matches Python dataclass equivalents.
 */
export function createDecodeError(params) {
    return {
        signature: params.signature ?? null,
        programId: params.programId ?? null,
        discriminator: params.discriminator,
        payloadLen: params.payloadLen,
        reason: params.reason,
        b64: params.b64,
    };
}
