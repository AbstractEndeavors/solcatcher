import { createDecodeError } from "./schema.js";
export class EventRegistry {
    decoders = new Map();
    names = new Map();
    errors = [];
    register(disc, name, decoder) {
        const hex = disc.toString("hex");
        this.decoders.set(hex, decoder);
        this.names.set(hex, name);
    }
    registerRaw(discHex, name, decoder) {
        this.decoders.set(discHex, decoder);
        this.names.set(discHex, name);
    }
    decode(b64Data, opts = {}) {
        const raw = Buffer.from(b64Data, "base64");
        const discHex = raw.subarray(0, 8).toString("hex");
        const decoder = this.decoders.get(discHex);
        if (!decoder) {
            this.errors.push(createDecodeError({
                signature: opts.signature,
                programId: opts.programId,
                discriminator: discHex,
                payloadLen: raw.length - 8,
                reason: "unknown discriminator",
                b64: b64Data,
            }));
            return null;
        }
        try {
            return decoder(raw);
        }
        catch (e) {
            this.errors.push(createDecodeError({
                signature: opts.signature,
                programId: opts.programId,
                discriminator: discHex,
                payloadLen: raw.length - 8,
                reason: `decode failed: ${e}`,
                b64: b64Data,
            }));
            return null;
        }
    }
    eventName(discHex) {
        return this.names.get(discHex);
    }
    errorsByDiscriminator() {
        const out = new Map();
        for (const e of this.errors) {
            const list = out.get(e.discriminator) || [];
            list.push(e);
            out.set(e.discriminator, list);
        }
        return out;
    }
}
export class InstructionRegistry {
    decoders = new Map();
    names = new Map();
    errors = [];
    register(disc, name, decoder) {
        const hex = disc.toString("hex");
        this.decoders.set(hex, decoder);
        this.names.set(hex, name);
    }
    registerRaw(discHex, name, decoder) {
        this.decoders.set(discHex, decoder);
        this.names.set(discHex, name);
    }
    decode(b64Data, opts = {}) {
        const raw = Buffer.from(b64Data, "base64");
        const discHex = raw.subarray(0, 8).toString("hex");
        const decoder = this.decoders.get(discHex);
        if (!decoder) {
            this.errors.push(createDecodeError({
                signature: opts.signature,
                programId: opts.programId,
                discriminator: discHex,
                payloadLen: raw.length - 8,
                reason: "unknown discriminator",
                b64: b64Data,
            }));
            return null;
        }
        try {
            return decoder(raw);
        }
        catch (e) {
            this.errors.push(createDecodeError({
                signature: opts.signature,
                programId: opts.programId,
                discriminator: discHex,
                payloadLen: raw.length - 8,
                reason: `decode failed: ${e}`,
                b64: b64Data,
            }));
            return null;
        }
    }
    instructionName(discHex) {
        return this.names.get(discHex);
    }
    errorsByDiscriminator() {
        const out = new Map();
        for (const e of this.errors) {
            const list = out.get(e.discriminator) || [];
            list.push(e);
            out.set(e.discriminator, list);
        }
        return out;
    }
}
