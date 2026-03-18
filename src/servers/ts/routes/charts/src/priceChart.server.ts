// priceChart.server.ts
// Server-side only: data normalization, OHLC resampling, highlight detection
// No rendering—returns JSON for client consumption

import {
  getSortedTxnHistory,
  getStringValue,
  getTimestamps,
  getTxnPrice,
  getSolAmount,
  getTokenAmount,
  getUserAddress,
  getMint,
  getBondingCurve,
  getSignature,
  getIsBuy,
  getVirtualSolReserves,
  getVirtualTokenReserves,
  ifListGetSingle,
} from './../imports/index.js';
import type {
  NormalizedTxn,
  ProcessOHLCParams,
  PairMeta,
  ChartHighlight,
  OHLCBar,
  OHLCResponse,
  VolumeBar
} from './../imports/index.js';

/* ---------------------------------------------
 * OHLC Resampling (pure function)
 * --------------------------------------------- */

export function resampleToOHLC(
  txns: NormalizedTxn[],
  intervalSeconds: number = 60
): OHLCBar[] {
  if (txns.length === 0) return [];

  const buckets = new Map<number, NormalizedTxn[]>();

  for (const txn of txns) {
    const bucketTime = Math.floor(txn.timestamp / intervalSeconds) * intervalSeconds;
    const existing = buckets.get(bucketTime);
    if (existing) {
      existing.push(txn);
    } else {
      buckets.set(bucketTime, [txn]);
    }
  }

  const bars: OHLCBar[] = [];

  for (const [time, bucket] of buckets) {
    bucket.sort((a, b) => a.timestamp - b.timestamp);

    const prices = bucket.map((t) => t.price);
    const volumes = bucket.map((t) => t.volume);

    bars.push({
      time,
      open: prices[0],
      high: Math.max(...prices),
      low: Math.min(...prices),
      close: prices[prices.length - 1],
      volume: volumes.reduce((a, b) => a + b, 0),
    });
  }

  return bars.sort((a, b) => a.time - b.time);
}

/* ---------------------------------------------
 * Extract highlights for a specific user
 * --------------------------------------------- */

export function extractHighlights(
  txns: NormalizedTxn[],
  userAddress: string,
  intervalSeconds: number = 60
): ChartHighlight[] {
  return txns
    .filter((t) => t.user_address === userAddress)
    .map((t) => ({
      time: Math.floor(t.timestamp / intervalSeconds) * intervalSeconds,
      type: t.is_buy ? "buy" as const : "sell" as const,
      user_address: userAddress,
      sol_amount: t.volume,
    }));
}

/* ---------------------------------------------
 * Resolve pair metadata
 * --------------------------------------------- */

function resolvePairMeta(
  txn_history: unknown[],
  pair_id: string | null | undefined,
  get_pair: ProcessOHLCParams["get_pair"],
  get_creation_decoded_data: ProcessOHLCParams["get_creation_decoded_data"]
): { meta: PairMeta; resolved_pair_id: string | null } {
  const sorted = getSortedTxnHistory(txn_history);

  if (sorted.length === 0) {
    return {
      meta: {
        mint: null,
        creator_address: null,
        bonding_curve: null,
        init_price: 0,
        init_sol_amount: 0,
        init_token_amount: 0,
        init_virtualSolReserves: 0,
        init_virtualTokenReserves: 0,
      },
      resolved_pair_id: null,
    };
  }

  const initial_txn = sorted[0];

  // Resolve pair_id
  let resolved_pair_id = pair_id ?? getStringValue(initial_txn, "pair_id");

  if (!resolved_pair_id) {
    const signature = getSignature(sorted[0]);
    if (signature) {
      const pair = ifListGetSingle(get_pair({ signature }));
      resolved_pair_id = getStringValue(pair, "id");
    }
  }

  if (!resolved_pair_id) {
    return {
      meta: {
        mint: null,
        creator_address: null,
        bonding_curve: null,
        init_price: getTxnPrice(initial_txn),
        init_sol_amount: getSolAmount(initial_txn),
        init_token_amount: getTokenAmount(initial_txn),
        init_virtualSolReserves: getVirtualSolReserves(initial_txn) ?? 0,
        init_virtualTokenReserves: getVirtualTokenReserves(initial_txn) ?? 0,
      },
      resolved_pair_id: null,
    };
  }

  // Fetch pair data
  let pair = get_pair({ pair_id: resolved_pair_id });
  let creator_address = getUserAddress(pair);

  if (!creator_address) {
    pair = get_creation_decoded_data({ pair_id: resolved_pair_id });
    creator_address = getUserAddress(pair);
  }

  return {
    meta: {
      mint: getMint(pair),
      creator_address,
      bonding_curve: getBondingCurve(pair),
      init_price: getTxnPrice(initial_txn),
      init_sol_amount: getSolAmount(initial_txn),
      init_token_amount: getTokenAmount(initial_txn),
      init_virtualSolReserves: getVirtualSolReserves(initial_txn) ?? 0,
      init_virtualTokenReserves: getVirtualTokenReserves(initial_txn) ?? 0,
    },
    resolved_pair_id,
  };
}

/* ---------------------------------------------
 * Main export: processOHLC
 * --------------------------------------------- */

export function processOHLC(params: ProcessOHLCParams): OHLCResponse {
  const {
    txn_history,
    interval_seconds = 60,
    highlight_user_address,
    pair_id,
    get_pair,
    get_creation_decoded_data,
  } = params;

  const sorted = getSortedTxnHistory(txn_history);

  // Normalize transactions
  const normalized: NormalizedTxn[] = [];

  for (const rawTxn of sorted) {
    const txn = Array.isArray(rawTxn) ? rawTxn[0] : rawTxn;
    try {
      normalized.push({
        timestamp: getTimestamps(txn),
        price: getTxnPrice(txn),
        volume: getSolAmount(txn),
        user_address: getUserAddress(txn),
        is_buy: getIsBuy(txn),
      });
    } catch (e) {
      console.error(`Normalization error: ${e}`);
    }
  }

  // Build OHLC
  const ohlc = resampleToOHLC(normalized, interval_seconds);

  // Build highlights
  const highlights = highlight_user_address
    ? extractHighlights(normalized, highlight_user_address, interval_seconds)
    : [];

  // Resolve metadata
  const { meta } = resolvePairMeta(
    txn_history,
    pair_id,
    get_pair,
    get_creation_decoded_data
  );

  return { ohlc, highlights, meta };
}


export function extractVolumeBars(
  ohlc: OHLCBar[],
  upColor: string = "#26a69a",
  downColor: string = "#ef5350"
): VolumeBar[] {
  return ohlc.map((bar) => ({
    time: bar.time,
    value: bar.volume,
    color: bar.close >= bar.open ? upColor : downColor,
  }));
}
