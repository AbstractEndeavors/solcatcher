/**
 * Master decoder module exports.
 */

// Schema types
export type { DecodeError } from "./schema.js";

export { createDecodeError } from "./schema.js";

// Registry classes
export { EventRegistry, InstructionRegistry } from "./registry.js";

// Environment classes
export {
  DecoderEnvironment,
  IdlDecoderEnvironment,
  getDecoderEnv,
  getIdlDecoderEnv,
  initIdlDecoderEnv,
} from "./environment.js";

// Build decoders
export type {
  // Types
  TypeSpec,
  FieldDef,
  TypeDef,
  InstructionDef,
  EventDef,
  AccountDef,
  ErrorDef,
  AnchorIDL,
  Reader,
  Decoder,
  } from "./buildDecoders.js";

  export {
  // Classes
  TypeResolver,
  DecoderRegistry,
  // Factory functions
  buildRegistryFromIdl,
  buildRegistryFromIdls,
  // Utilities
  discFromArray,
  discToHex,
  discFromHex,
  buildDiscriminatorTable,
  printDiscriminatorTable,
  // Base64 helpers
  decodeBase64,
  decodeBase64Event,
  decodeBase64Instruction,
  decodeBase64Any,
} from "./buildDecoders.js";
