// src/functions/decodeUtils/bondingCurves.ts
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, stripQuotes, getLogString } from './imports.js';
import { PublicKey } from './../types.js';
import { getPubkeyString, getPubkey } from './pubKeyUtils.js';
const FILE_LOCATION = 'src/functions/decodeUtils/bondingCurves.ts';
export async function deriveBondingCurve(mint, programId) {
    const mintPubkey = getPubkey(mint);
    const mintBytes = mintPubkey.toBuffer();
    const programPubkey = getPubkey(programId);
    const [bondingCurvePk, bump] = await PublicKey.findProgramAddressSync([Buffer.from("bonding-curve"), mintBytes], programPubkey);
    const bonding_curve = stripQuotes(getPubkeyString(bondingCurvePk));
    return bonding_curve;
}
/**
 * Derive the associated bonding curve for a given bonding curve and mint.
 */
export async function deriveAssociatedBondingCurve(bondingCurve, mint) {
    let bondingCurvePubkey = getPubkey(bondingCurve);
    let mintPubkey = getPubkey(mint);
    const [associatedBondingCurvePk] = PublicKey.findProgramAddressSync([
        bondingCurvePubkey.toBuffer(),
        TOKEN_PROGRAM_ID.toBuffer(),
        mintPubkey.toBuffer()
    ], ASSOCIATED_TOKEN_PROGRAM_ID);
    const associated_bonding_curve = stripQuotes(getPubkeyString(associatedBondingCurvePk));
    return associated_bonding_curve;
}
/**
 * Derive both bonding curve and associated bonding curve for a given mint and program ID.
 */
export async function deriveBondingCurves(mint, programId) {
    let mintPubkey = getPubkey(mint);
    let mintBytes = mintPubkey.toBuffer();
    let programPubkey = getPubkey(programId);
    let bondingCurve = await deriveBondingCurve(mintPubkey, programPubkey);
    let associatedBondingCurve = await deriveAssociatedBondingCurve(bondingCurve, mintPubkey);
    return { bondingCurve, associatedBondingCurve };
}
export async function bondingCurveSpec(mint, program_id = null, bonding_curve = null, associated_bonding_curve = null) {
    let bonding_curves = {
        bonding_curve,
        associated_bonding_curve
    };
    getLogString({
        message: 'initial bonding curves',
        logType: 'debug',
        details: JSON.stringify(bonding_curves),
        function_name: 'bondingCurveSpec',
        file_location: FILE_LOCATION
    });
    // 🔹 Derive BOTH if neither provided
    if (!bonding_curves.bonding_curve &&
        !bonding_curves.associated_bonding_curve &&
        mint &&
        program_id) {
        const derived = await deriveBondingCurves(mint, program_id);
        bonding_curves = {
            bonding_curve: derived.bondingCurve,
            associated_bonding_curve: derived.associatedBondingCurve
        };
    }
    // 🔹 Derive bonding curve only
    if (!bonding_curves.bonding_curve &&
        mint &&
        program_id) {
        bonding_curves.bonding_curve =
            await deriveBondingCurve(mint, program_id);
    }
    // 🔹 Derive associated bonding curve only
    if (!bonding_curves.associated_bonding_curve &&
        bonding_curves.bonding_curve &&
        mint) {
        bonding_curves.associated_bonding_curve =
            await deriveAssociatedBondingCurve(bonding_curves.bonding_curve, mint);
    }
    getLogString({
        message: 'final bonding curves',
        logType: 'debug',
        details: JSON.stringify(bonding_curves),
        function_name: 'bondingCurveSpec',
        file_location: FILE_LOCATION
    });
    return bonding_curves;
}
