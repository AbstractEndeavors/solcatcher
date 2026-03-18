/**
 * DECODED EVENT SCHEMAS
 *
 * Explicit contracts for every decode output.
 * No ad-hoc objects — the classifier emits these, consumers depend on these.
 *
 * Pattern: Schemas over ad-hoc objects
 */
export {};
// ============================================================
// CLASSIFICATION ENUM (Registry, not string comparison)
// ============================================================
// ============================================================
// PROVENANCE — where the decode came from
// ============================================================
/*export interface DecodeProvenance {
  readonly payload_id: IdLike;
  readonly signature: SigLike;
  readonly program_id: AddressLike;
  readonly discriminator: string;
  readonly invocation_index: IntLike;
  readonly depth: IntLike;
}

// ============================================================
// TRADE EVENT (decoded + typed)
// ============================================================

export interface DecodedTradeEvents extends DecodedTradeEvent{
  readonly kind: typeof EventKind.TRADE;
  readonly provenance: DecodeProvenance;


  * Raw decoded data for passthrough — everything the registry emitted
  readonly raw: Record<string, unknown>;
}

// ============================================================
// CREATE EVENT (decoded + typed)
// ============================================================

export interface DecodedCreateEvents extends DecodedCreateEvent {
  readonly kind: typeof EventKind.CREATE;
  readonly provenance: DecodeProvenance;


  /** Raw decoded data for passthrough
  readonly raw: Record<string, unknown>;
}*/
