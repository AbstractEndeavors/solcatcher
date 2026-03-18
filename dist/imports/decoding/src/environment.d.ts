/**
 * Decoder environment - single entry point for decoding.
 * Matches Python environment.py structure.
 */
import { EventRegistry } from "./registry.js";
import type { DecodeError } from "./schema.js";
import { type AnchorIDL } from "./buildDecoders.js";
export declare class DecoderEnvironment {
    registry: EventRegistry;
    constructor();
    /**
     * Override in subclass to wire up decoders.
     * Example:
     *   this.registry.registerRaw("e445a52e51cb9a1d", "CreateEvent", decodeCreateEvent);
     */
    protected wire(): void;
    decode(b64: string, ctx?: {
        signature?: string;
        programId?: string;
    }): unknown | null;
    decodeRow(row: {
        b64: string;
        signature?: string;
        programId?: string;
    }): unknown | null;
    get errors(): DecodeError[];
}
/**
 * IDL-based decoder environment.
 * Auto-wires from Anchor IDL(s).
 */
export declare class IdlDecoderEnvironment {
    private decoderRegistry;
    constructor(idls: AnchorIDL | AnchorIDL[]);
    decode(b64: string): {
        name: string;
        category: string;
        data: Record<string, unknown>;
    } | null;
    decodeEvent(b64: string): {
        name: string;
        data: Record<string, unknown>;
    } | null;
    decodeInstruction(b64: string): {
        name: string;
        data: Record<string, unknown>;
    } | null;
    decodeAccount(b64: string): {
        name: string;
        data: Record<string, unknown>;
    } | null;
    decodeRow(row: {
        b64: string;
    }): {
        name: string;
        category: string;
        data: Record<string, unknown>;
    } | null;
    listEvents(): [string, string][];
    listInstructions(): [string, string][];
    listAccounts(): [string, string][];
    getError(code: number): import("./buildDecoders.js").ErrorDef | undefined;
}
export declare function getDecoderEnv(): DecoderEnvironment;
export declare function getIdlDecoderEnv(idls?: AnchorIDL | AnchorIDL[]): IdlDecoderEnvironment;
export declare function initIdlDecoderEnv(idls: AnchorIDL | AnchorIDL[]): IdlDecoderEnvironment;
