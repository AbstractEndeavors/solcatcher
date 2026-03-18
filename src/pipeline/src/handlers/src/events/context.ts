import type {DecodedTradeEvents,DecodedCreateEvents,EnrichmentContextWithEvents} from '@imports';
// ============================================================
// CONTEXT APPLICATORS
// ============================================================

export function applyTradeToContext(ctx: EnrichmentContextWithEvents, trade: DecodedTradeEvents): void {
  if (ctx.pair.virtual_token_reserves == null && trade.virtual_token_reserves != null) {
    ctx.pair.virtual_token_reserves = trade.virtual_token_reserves;
    ctx.enrich_fields.pair.push('virtual_token_reserves');
  }
  if (ctx.pair.virtual_sol_reserves == null && trade.virtual_sol_reserves != null) {
    ctx.pair.virtual_sol_reserves = trade.virtual_sol_reserves;
    ctx.enrich_fields.pair.push('virtual_sol_reserves');
  }
  if (ctx.pair.real_token_reserves == null && trade.real_token_reserves != null) {
    ctx.pair.real_token_reserves = trade.real_token_reserves;
    ctx.enrich_fields.pair.push('real_token_reserves');
  }
}

export function applyCreateToContext(ctx: EnrichmentContextWithEvents, create: DecodedCreateEvents): void {
  if (ctx.pair.creator            == null && create.creator           != null) { ctx.pair.creator = create.creator; ctx.enrich_fields.pair.push('creator'); }
  if (ctx.pair.timestamp          == null && create.timestamp         != null) { ctx.pair.timestamp = create.timestamp; ctx.enrich_fields.pair.push('timestamp'); }
  if (ctx.pair.token_total_supply == null && create.token_total_supply != null) { ctx.pair.token_total_supply = create.token_total_supply; ctx.enrich_fields.pair.push('token_total_supply'); }
  if (ctx.meta.uri                == null && create.uri               != null) { ctx.meta.uri = create.uri; ctx.enrich_fields.meta.push('uri'); }
  if (ctx.meta.name               == null && create.name              != null) { ctx.meta.name = create.name; ctx.enrich_fields.meta.push('name'); }
  if (ctx.meta.symbol             == null && create.symbol            != null) { ctx.meta.symbol = create.symbol; ctx.enrich_fields.meta.push('symbol'); }
  if (ctx.meta.creator            == null && create.creator           != null) { ctx.meta.creator = create.creator; ctx.enrich_fields.meta.push('creator'); }
  if (ctx.meta.user_address       == null && create.user         != null) { ctx.meta.user_address = create.user; ctx.enrich_fields.meta.push('user_address'); }
  // description: tracked as pending only — enrichOffchainMeta writes the blob
  if (ctx.meta.offchain_metadata?.description == null && create.description != null) {
    ctx.enrich_fields.meta.push('description');
  }
}
