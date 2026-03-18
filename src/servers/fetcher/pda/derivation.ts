// src/pipeline/pda/derivation.ts

import { PublicKey } from '@solana/web3.js';
import { PROGRAM_IDS, SEEDS } from './constants.js';
import { MintParam, ProgramParam, DerivedPDAsResult } from './schemas.js';
import type { MintLike, AddressLike,BoolLike,IdentityParams } from '@imports';
import {getPubkeyString,ensureStringOptional} from '@imports';
// ═══════════════════════════════════════════════════════════
// METADATA PDA
// ═══════════════════════════════════════════════════════════

/**
 * Derive Metaplex metadata PDA for a mint
 * 
 * Seeds: ["metadata", METADATA_PROGRAM_ID, mint]
 */
export function deriveMetadataPDA(mint: MintLike): PublicKey {
  const mintParam = new MintParam(mint);
  
  const [pda] = PublicKey.findProgramAddressSync(
    [
      SEEDS.METADATA,
      PROGRAM_IDS.METADATA.toBuffer(),
      mintParam.pubkey.toBuffer(),
    ],
    PROGRAM_IDS.METADATA
  );
  
  return pda;
}

/**
 * Get metadata PDA as base58 string
 */
export function getMetadataPDAAddress(mint: MintLike): string {
  return deriveMetadataPDA(mint).toBase58();
}

// ═══════════════════════════════════════════════════════════
// BONDING CURVE PDA
// ═══════════════════════════════════════════════════════════

/**
 * Derive pump.fun bonding curve PDA for a mint
 * 
 * Seeds: ["bonding-curve", mint]
 */
export function deriveBondingCurvePDA(
  mint: MintLike,
  programId: AddressLike = PROGRAM_IDS.PUMP_FUN
): PublicKey {
  const mintParam = new MintParam(mint);
  const programParam = new ProgramParam(programId);
  
  const [pda] = PublicKey.findProgramAddressSync(
    [
      SEEDS.BONDING_CURVE,
      mintParam.pubkey.toBuffer(),
    ],
    programParam.pubkey
  );
  
  return pda;
}

/**
 * Get bonding curve PDA as base58 string
 */
export function getBondingCurvePDAAddress(
  mint: MintLike,
  programId: AddressLike = PROGRAM_IDS.PUMP_FUN
): string {
  return deriveBondingCurvePDA(mint, programId).toBase58();
}

// ═══════════════════════════════════════════════════════════
// ASSOCIATED BONDING CURVE (ATA for Bonding Curve)
// ═══════════════════════════════════════════════════════════

/**
 * Derive associated token account for bonding curve
 * 
 * This is the ATA that holds the token reserves
 * Seeds: [bonding_curve, TOKEN_PROGRAM, mint]
 */
export function deriveAssociatedBondingCurvePDA(
  mint: MintLike,
  bonding_curve: MintLike,
  token_program: AddressLike = PROGRAM_IDS.TOKEN
): PublicKey {
  const mintParam = new MintParam(mint);
  const bonding_curve_param = new MintParam(bonding_curve);
  const token_program_param = new ProgramParam(token_program);
  
  const [pda] = PublicKey.findProgramAddressSync(
    [
      bonding_curve_param.pubkey.toBuffer(),
      token_program_param.pubkey.toBuffer(),
      mintParam.pubkey.toBuffer(),
    ],
    PROGRAM_IDS.ASSOCIATED_TOKEN
  );
  
  return pda;
}

/**
 * Get associated bonding curve PDA as base58 string
 */
export function getAssociatedBondingCurvePDAAddress(
  mint: MintLike,
  bonding_curve: MintLike,
  token_program: AddressLike = PROGRAM_IDS.TOKEN
): string {
  return deriveAssociatedBondingCurvePDA(mint, bonding_curve, token_program).toBase58();
}

// ═══════════════════════════════════════════════════════════
// DERIVE ALL PDAs
// ═══════════════════════════════════════════════════════════

/**
 * Derive all relevant PDAs for a pump.fun token
 * 
 * Returns:
 * - metadata: Metaplex metgetPubKeyStringadata PDA
 * - bondingCurve: Pump.fun bonding curve PDA
 * - associatedBondingCurve: ATA for bonding curve (token reserves)
 */
export function deriveAllPDAs(
  mint: MintLike,
  program_id: AddressLike = PROGRAM_IDS.PUMP_FUN,
  token_program: AddressLike = PROGRAM_IDS.TOKEN
): DerivedPDAsResult {
  const mint_param = new MintParam(mint);
  const program_param = new ProgramParam(program_id);
  
  const metadata = deriveMetadataPDA(mint_param.pubkey);
  const bonding_curve = deriveBondingCurvePDA(mint_param.pubkey, program_param.pubkey);
  const associated_bonding_urve = deriveAssociatedBondingCurvePDA(
    mint_param.pubkey,
    bonding_curve,
    token_program
  );
  
  return new DerivedPDAsResult(
    getPubkeyString(mint_param.address),
    getPubkeyString(metadata),
    getPubkeyString(bonding_curve),
    getPubkeyString(associated_bonding_urve),
    getPubkeyString(program_param.address),
    getPubkeyString(token_program)
    
  );
}

// ═══════════════════════════════════════════════════════════
// UTILITY: Detect Token Program
// ═══════════════════════════════════════════════════════════

/**
 * Check if mint uses Token-2022 program
 * 
 * Pump.fun tokens created after a certain date use Token-2022
 */
export function isToken2022Mint(mintSuffix: string): BoolLike {
  // Pump.fun mints ending in 'pump' use Token-2022
  return mintSuffix.toLowerCase().endsWith('pump');
}

/**
 * Get appropriate token program for a mint
 */
export function getTokenProgramForMint(mint: MintLike): PublicKey {
  const mint_param = new MintParam(mint);
  return isToken2022Mint(mint_param.address as string) 
    ? PROGRAM_IDS.TOKEN_2022 
    : PROGRAM_IDS.TOKEN;
}

/**
 * Derive all PDAs with auto-detected token program
 */
export function deriveAllPDAsAuto(params:IdentityParams
): DerivedPDAsResult {
  const token_program = getTokenProgramForMint(params.mint);
  const pdas = deriveAllPDAs(params.mint, params.program_id, token_program);
  
  return pdas
}
