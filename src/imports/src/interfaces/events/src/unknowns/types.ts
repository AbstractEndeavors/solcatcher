import {EventKind,type DecodeProvenance} from './imports.js';
export interface DecodedUnknownEvent {
  readonly kind: typeof EventKind.UNKNOWN;
  readonly provenance: DecodeProvenance;
  readonly discriminator: string;
  readonly raw: Record<string, unknown>;
}
