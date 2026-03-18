import type {IdLike} from '@imports';
export interface ChartRouteParams {
  id?: IdLike;
  interval?: string;
  highlight_user?: string;
}
/* ---------------------------------------------
 * Schemas
 * --------------------------------------------- */

export interface OHLCBar {
  time: number; // unix seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface ChartHighlight {
  time: number;
  type: "buy" | "sell";
  user_address: string;
  sol_amount: number;
}

export interface PairMeta {
  mint: string | null;
  creator_address: string | null;
  bonding_curve: string | null;
  init_price: number;
  init_sol_amount: number;
  init_token_amount: number;
  init_virtualSolReserves: number;
  init_virtualTokenReserves: number;
}

export interface OHLCResponse {
  ohlc: OHLCBar[];
  highlights: ChartHighlight[];
  meta: PairMeta;
}

export interface ProcessOHLCParams {
  txn_history: unknown[];
  interval_seconds?: number;
  highlight_user_address?: string | null;
  pair_id?: string | null;
  get_pair: (opts: { pair_id?: string; signature?: string }) => unknown;
  get_creation_decoded_data: (opts: { pair_id: string }) => unknown;
}

/* ---------------------------------------------
 * Internal types
 * --------------------------------------------- */

export interface NormalizedTxn {
  timestamp: number;
  price: number;
  volume: number;
  user_address: string | null;
  is_buy: boolean;
}

/* ---------------------------------------------
 * Profit / volume tally (main function)
 * --------------------------------------------- */

export interface UserTxnStats {
  profits: { sol: number; token: number };
  avgPrice: { token_amount: number; sol: number; avg: number };
  volume: { buy: number; sell: number; total: number };
  txns: string[];
}

/* ---------------------------------------------
 * Volume-only bars (for separate volume chart)
 * --------------------------------------------- */

export interface VolumeBar {
  time: number;
  value: number;
  color: string;
}


/* ---------------------------------------------
 * Dependencies (inject these, don't import globals)
 * --------------------------------------------- */

export interface OHLCRouteContext {
  get_transactions: (opts: { pair_id: string }) => Promise<unknown[]>;
  get_pair: (opts: { pair_id?: string; signature?: string }) => unknown;
  get_creation_decoded_data: (opts: { pair_id: string }) => unknown;
}
