import type { NormalizedTxn, ProcessOHLCParams, ChartHighlight, OHLCBar, OHLCResponse, VolumeBar } from './../imports/index.js';
export declare function resampleToOHLC(txns: NormalizedTxn[], intervalSeconds?: number): OHLCBar[];
export declare function extractHighlights(txns: NormalizedTxn[], userAddress: string, intervalSeconds?: number): ChartHighlight[];
export declare function processOHLC(params: ProcessOHLCParams): OHLCResponse;
export declare function extractVolumeBars(ohlc: OHLCBar[], upColor?: string, downColor?: string): VolumeBar[];
