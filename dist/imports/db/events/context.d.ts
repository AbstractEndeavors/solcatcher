import type { DecodedTradeEvents, DecodedCreateEvents, EnrichmentContextWithEvents } from '@imports';
export declare function applyTradeToContext(ctx: EnrichmentContextWithEvents, trade: DecodedTradeEvents): void;
export declare function applyCreateToContext(ctx: EnrichmentContextWithEvents, create: DecodedCreateEvents): void;
