/**
 * Event and Instruction registries with error tracking.
 * Matches Python registry.py structure.
 */
import type { DecodeError } from "./schema.js";
import { createDecodeError } from "./schema.js";

type DecoderFn = (raw: Buffer) => unknown;

export class EventRegistry {
  private decoders = new Map<string, DecoderFn>();
  private names = new Map<string, string>();
  errors: DecodeError[] = [];

  register(disc: Buffer, name: string, decoder: DecoderFn): void {
    const hex = disc.toString("hex");
    this.decoders.set(hex, decoder);
    this.names.set(hex, name);
  }

  registerRaw(discHex: string, name: string, decoder: DecoderFn): void {
    this.decoders.set(discHex, decoder);
    this.names.set(discHex, name);
  }

  decode(
    b64Data: string,
    opts: { signature?: string; programId?: string } = {}
  ): unknown | null {
    const raw = Buffer.from(b64Data, "base64");
    const discHex = raw.subarray(0, 8).toString("hex");

    const decoder = this.decoders.get(discHex);
    if (!decoder) {
      this.errors.push(
        createDecodeError({
          signature: opts.signature,
          programId: opts.programId,
          discriminator: discHex,
          payloadLen: raw.length - 8,
          reason: "unknown discriminator",
          b64: b64Data,
        })
      );
      return null;
    }

    try {
      return decoder(raw);
    } catch (e) {
      this.errors.push(
        createDecodeError({
          signature: opts.signature,
          programId: opts.programId,
          discriminator: discHex,
          payloadLen: raw.length - 8,
          reason: `decode failed: ${e}`,
          b64: b64Data,
        })
      );
      return null;
    }
  }

  eventName(discHex: string): string | undefined {
    return this.names.get(discHex);
  }

  errorsByDiscriminator(): Map<string, DecodeError[]> {
    const out = new Map<string, DecodeError[]>();
    for (const e of this.errors) {
      const list = out.get(e.discriminator) || [];
      list.push(e);
      out.set(e.discriminator, list);
    }
    return out;
  }
}

export class InstructionRegistry {
  private decoders = new Map<string, DecoderFn>();
  private names = new Map<string, string>();
  errors: DecodeError[] = [];

  register(disc: Buffer, name: string, decoder: DecoderFn): void {
    const hex = disc.toString("hex");
    this.decoders.set(hex, decoder);
    this.names.set(hex, name);
  }

  registerRaw(discHex: string, name: string, decoder: DecoderFn): void {
    this.decoders.set(discHex, decoder);
    this.names.set(discHex, name);
  }

  decode(
    b64Data: string,
    opts: { signature?: string; programId?: string } = {}
  ): unknown | null {
    const raw = Buffer.from(b64Data, "base64");
    const discHex = raw.subarray(0, 8).toString("hex");

    const decoder = this.decoders.get(discHex);
    if (!decoder) {
      this.errors.push(
        createDecodeError({
          signature: opts.signature,
          programId: opts.programId,
          discriminator: discHex,
          payloadLen: raw.length - 8,
          reason: "unknown discriminator",
          b64: b64Data,
        })
      );
      return null;
    }

    try {
      return decoder(raw);
    } catch (e) {
      this.errors.push(
        createDecodeError({
          signature: opts.signature,
          programId: opts.programId,
          discriminator: discHex,
          payloadLen: raw.length - 8,
          reason: `decode failed: ${e}`,
          b64: b64Data,
        })
      );
      return null;
    }
  }

  instructionName(discHex: string): string | undefined {
    return this.names.get(discHex);
  }

  errorsByDiscriminator(): Map<string, DecodeError[]> {
    const out = new Map<string, DecodeError[]>();
    for (const e of this.errors) {
      const list = out.get(e.discriminator) || [];
      list.push(e);
      out.set(e.discriminator, list);
    }
    return out;
  }
}
