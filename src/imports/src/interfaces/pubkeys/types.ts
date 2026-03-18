
import type {AddressLike} from './imports.js';
export {PublicKey} from '@solana/web3.js';

export type BondingCurveSpec = {
  bonding_curve: AddressLike;
  associated_bonding_curve: AddressLike;
};
export type { TransactionSignature } from "@solana/web3.js";