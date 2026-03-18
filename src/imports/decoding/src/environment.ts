/**
 * Decoder environment - single entry point for decoding.
 * Matches Python environment.py structure.
 */

import { EventRegistry } from "./registry.js";
import type { DecodeError } from "./schema.js";
import {
  DecoderRegistry,
  buildRegistryFromIdl,
  buildRegistryFromIdls,
  type AnchorIDL,
} from "./buildDecoders.js";

type DecoderFn = (raw: Buffer) => unknown;

export class DecoderEnvironment {
  registry: EventRegistry;

  constructor() {
    this.registry = new EventRegistry();
    this.wire();
  }

  /**
   * Override in subclass to wire up decoders.
   * Example:
   *   this.registry.registerRaw("e445a52e51cb9a1d", "CreateEvent", decodeCreateEvent);
   */
  protected wire(): void {
    // Override in subclass
  }

  decode(b64: string, ctx: { signature?: string; programId?: string } = {}): unknown | null {
    return this.registry.decode(b64, ctx);
  }

  decodeRow(row: { b64: string; signature?: string; programId?: string }): unknown | null {
    return this.registry.decode(row.b64, {
      signature: row.signature,
      programId: row.programId,
    });
  }

  get errors(): DecodeError[] {
    return this.registry.errors;
  }
}

/**
 * IDL-based decoder environment.
 * Auto-wires from Anchor IDL(s).
 */
export class IdlDecoderEnvironment {
  private decoderRegistry: DecoderRegistry;

  constructor(idls: AnchorIDL | AnchorIDL[]) {
    if (Array.isArray(idls)) {
      this.decoderRegistry = buildRegistryFromIdls(idls);
    } else {
      this.decoderRegistry = buildRegistryFromIdl(idls);
    }
  }

  decode(b64: string): { name: string; category: string; data: Record<string, unknown> } | null {
    const raw = Buffer.from(b64, "base64");
    return this.decoderRegistry.decode(raw);
  }

  decodeEvent(b64: string): { name: string; data: Record<string, unknown> } | null {
    const raw = Buffer.from(b64, "base64");
    return this.decoderRegistry.decodeEvent(raw);
  }

  decodeInstruction(b64: string): { name: string; data: Record<string, unknown> } | null {
    const raw = Buffer.from(b64, "base64");
    return this.decoderRegistry.decodeInstruction(raw);
  }

  decodeAccount(b64: string): { name: string; data: Record<string, unknown> } | null {
    const raw = Buffer.from(b64, "base64");
    return this.decoderRegistry.decodeAccount(raw);
  }

  decodeRow(row: { b64: string }): { name: string; category: string; data: Record<string, unknown> } | null {
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

  getError(code: number) {
    return this.decoderRegistry.getError(code);
  }
}

// =============================================================================
// LAZY SINGLETON PATTERN
// =============================================================================

let _env: DecoderEnvironment | null = null;

export function getDecoderEnv(): DecoderEnvironment {
  if (!_env) {
    _env = new DecoderEnvironment();
  }
  return _env;
}

let _idlEnv: IdlDecoderEnvironment | null = null;

export function getIdlDecoderEnv(idls?: AnchorIDL | AnchorIDL[]): IdlDecoderEnvironment {
  if (!_idlEnv && idls) {
    _idlEnv = new IdlDecoderEnvironment(idls);
  }
  if (!_idlEnv) {
    throw new Error("IdlDecoderEnvironment not initialized. Pass IDL(s) on first call.");
  }
  return _idlEnv;
}

export function initIdlDecoderEnv(idls: AnchorIDL | AnchorIDL[]): IdlDecoderEnvironment {
  _idlEnv = new IdlDecoderEnvironment(idls);
  return _idlEnv;
}
