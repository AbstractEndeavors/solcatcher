/**
 * Decoder environment - single entry point for decoding.
 * Matches Python environment.py structure.
 */
import { EventRegistry } from "./registry.js";
import { DecoderRegistry, buildRegistryFromIdl, buildRegistryFromIdls, } from "./buildDecoders.js";
export class DecoderEnvironment {
    registry;
    constructor() {
        this.registry = new EventRegistry();
        this.wire();
    }
    /**
     * Override in subclass to wire up decoders.
     * Example:
     *   this.registry.registerRaw("e445a52e51cb9a1d", "CreateEvent", decodeCreateEvent);
     */
    wire() {
        // Override in subclass
    }
    decode(b64, ctx = {}) {
        return this.registry.decode(b64, ctx);
    }
    decodeRow(row) {
        return this.registry.decode(row.b64, {
            signature: row.signature,
            programId: row.programId,
        });
    }
    get errors() {
        return this.registry.errors;
    }
}
/**
 * IDL-based decoder environment.
 * Auto-wires from Anchor IDL(s).
 */
export class IdlDecoderEnvironment {
    decoderRegistry;
    constructor(idls) {
        if (Array.isArray(idls)) {
            this.decoderRegistry = buildRegistryFromIdls(idls);
        }
        else {
            this.decoderRegistry = buildRegistryFromIdl(idls);
        }
    }
    decode(b64) {
        const raw = Buffer.from(b64, "base64");
        return this.decoderRegistry.decode(raw);
    }
    decodeEvent(b64) {
        const raw = Buffer.from(b64, "base64");
        return this.decoderRegistry.decodeEvent(raw);
    }
    decodeInstruction(b64) {
        const raw = Buffer.from(b64, "base64");
        return this.decoderRegistry.decodeInstruction(raw);
    }
    decodeAccount(b64) {
        const raw = Buffer.from(b64, "base64");
        return this.decoderRegistry.decodeAccount(raw);
    }
    decodeRow(row) {
        return this.decode(row.b64);
    }
    listEvents() {
        return this.decoderRegistry.listEvents();
    }
    listInstructions() {
        return this.decoderRegistry.listInstructions();
    }
    listAccounts() {
        return this.decoderRegistry.listAccounts();
    }
    getError(code) {
        return this.decoderRegistry.getError(code);
    }
}
// =============================================================================
// LAZY SINGLETON PATTERN
// =============================================================================
let _env = null;
export function getDecoderEnv() {
    if (!_env) {
        _env = new DecoderEnvironment();
    }
    return _env;
}
let _idlEnv = null;
export function getIdlDecoderEnv(idls) {
    if (!_idlEnv && idls) {
        _idlEnv = new IdlDecoderEnvironment(idls);
    }
    if (!_idlEnv) {
        throw new Error("IdlDecoderEnvironment not initialized. Pass IDL(s) on first call.");
    }
    return _idlEnv;
}
export function initIdlDecoderEnv(idls) {
    _idlEnv = new IdlDecoderEnvironment(idls);
    return _idlEnv;
}
