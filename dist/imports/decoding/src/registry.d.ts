/**
 * Event and Instruction registries with error tracking.
 * Matches Python registry.py structure.
 */
import type { DecodeError } from "./schema.js";
type DecoderFn = (raw: Buffer) => unknown;
export declare class EventRegistry {
    private decoders;
    private names;
    errors: DecodeError[];
    register(disc: Buffer, name: string, decoder: DecoderFn): void;
    registerRaw(discHex: string, name: string, decoder: DecoderFn): void;
    decode(b64Data: string, opts?: {
        signature?: string;
        programId?: string;
    }): unknown | null;
    eventName(discHex: string): string | undefined;
    errorsByDiscriminator(): Map<string, DecodeError[]>;
}
export declare class InstructionRegistry {
    private decoders;
    private names;
    errors: DecodeError[];
    register(disc: Buffer, name: string, decoder: DecoderFn): void;
    registerRaw(discHex: string, name: string, decoder: DecoderFn): void;
    decode(b64Data: string, opts?: {
        signature?: string;
        programId?: string;
    }): unknown | null;
    instructionName(discHex: string): string | undefined;
    errorsByDiscriminator(): Map<string, DecodeError[]>;
}
export {};
