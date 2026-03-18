// src/pipeline/pda/schemas.ts

import { PublicKey } from '@solana/web3.js';
import type { DerivedPDAs, BondingCurveData, GenesisInfo, TokenPDAInfo } from './types.js';
import {getPubkeyString,getPubkey, ensureString} from '@imports'
import type {MintLike,AddressLike,SigLike,IntLike} from '@imports';
// ═══════════════════════════════════════════════════════════
// SCHEMA BASE
// ═══════════════════════════════════════════════════════════

abstract class Schema {
  constructor() {
    this.validate();
  }
  protected abstract validate(): void;
}

// ═══════════════════════════════════════════════════════════
// INPUT VALIDATION
// ═══════════════════════════════════════════════════════════

export class MintParam extends Schema {
  public readonly pubkey: PublicKey;
  public readonly address: AddressLike;

  constructor(mint: AddressLike) {
    super();
    this.pubkey = getPubkey(mint);
    this.address = getPubkeyString(this.pubkey);
  }

  protected validate(): void {
    // PublicKey constructor throws if invalid
  }
}

export class ProgramParam extends Schema {
  public readonly pubkey: PublicKey;
  public readonly address: AddressLike;

  constructor(program_id: AddressLike | PublicKey) {
    super();
    this.pubkey = getPubkey(program_id);
    this.address = getPubkeyString(this.pubkey);
  }

  protected validate(): void {
    // PublicKey constructor throws if invalid
  }
}

// ═══════════════════════════════════════════════════════════
// RESULT WRAPPERS
// ═══════════════════════════════════════════════════════════

export class DerivedPDAsResult implements DerivedPDAs {
  constructor(
    public readonly mint: MintLike,
    public readonly metaplex: AddressLike,
    public readonly bonding_curve: AddressLike,
    public readonly associated_bonding_curve: AddressLike,
    public readonly program_id: AddressLike,
    public readonly token_program:AddressLike
  ) {}

  toJSON(): DerivedPDAs {
    return {
      mint: this.mint,
      metaplex: this.metaplex,
      bonding_curve: this.bonding_curve,
      associated_bonding_curve: this.associated_bonding_curve,
      program_id: this.program_id,
    };
  }
}

export class BondingCurveDataResult implements BondingCurveData {
  constructor(
    public readonly mint: MintLike,
    public readonly creator: AddressLike,
    public readonly virtual_token_reserves: bigint,
    public readonly virtual_sol_reserves: bigint,
    public readonly real_token_reserves: bigint,
    public readonly real_sol_reserves: bigint,
    public readonly token_total_supply: bigint,
    public readonly is_complete: boolean,
    public readonly token_program: AddressLike
  ) {}

  toJSON(): Record<string, unknown> {
    return {
      mint: this.mint,
      creator: this.creator,
      virtual_token_reserves: ensureString(this.virtual_token_reserves),
      virtual_sol_reserves: ensureString(this.virtual_sol_reserves),
      real_token_reserves: ensureString(this.real_token_reserves),
      real_sol_reserves: ensureString(this.real_sol_reserves),
      token_total_supply: ensureString(this.token_total_supply),
      is_complete: this.is_complete,
      token_program: this.token_program,
    };
  }
}

export class GenesisInfoResult implements GenesisInfo {
  constructor(
    public readonly signature: SigLike,
    public readonly block_time: IntLike,
    public readonly slot: IntLike,
    public readonly creator: AddressLike,
    public readonly source: 'metadata_pda' | 'bonding_curve' | 'mint_account'
  ) {}

  toJSON(): GenesisInfo {
    return {
      signature: this.signature,
      block_time: this.block_time,
      slot: this.slot,
      creator: this.creator,
      source: this.source,
    };
  }
}

export class TokenPDAInfoResult implements TokenPDAInfo {
  constructor(
    public readonly pdas: DerivedPDAsResult,
    public readonly bonding_curve_data: BondingCurveDataResult | null,
    public readonly genesis: GenesisInfoResult | null
  ) {}

  toJSON(): Record<string, unknown> {
    return {
      pdas: this.pdas.toJSON(),
      bonding_curve_data: this.bonding_curve_data?.toJSON() ?? null,
      genesis: this.genesis?.toJSON() ?? null,
    };
  }
}
