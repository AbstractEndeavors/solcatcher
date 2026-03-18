export * from '@repositories/workflows/logData/enricher/index.js';
export { getRepoServices } from '@repoServices';
/*/ Process event with repos
const eventCtx = {
  signature: pair.signature,
  slot,
  program_id,
  log_id,
  invocation: logPayload.invocation_index,
  mint,
};
kind = 'trade'
const results = [{kind, log_id, pair_id, meta_id, txn_id}];
uri = data.uri
const enrichmentTasks:EnrichmentTask[] = [{ queue: 'metaEnrich', payload: { meta_id, mint, program_id, uri:data.uri }
}];
await processTradeEvent(data, eventCtx, { pairsRepo, metaDataRepo, transactionsRepo }, results, enrichmentTasks);
}

// Process event with repos
const eventCtx = {
  signature,
  slot,
  program_id,
  log_id,
  invocation: logPayload.invocation_index,
  mint
};
pair_id = pair_id || getIdOrNull(pair)
meta_id = pair.meta_id
uri = meta.uri
kind='create'
const results = [{
  kind,
  log_id,
  pair_id,
  meta_id,
  txn_id
}];
const enrichmentTasks:EnrichmentTask[] = [{ queue: 'metaEnrich', payload: {
  meta_id ,
  mint ,
  program_id,
  uri
}
}];

await processCreateEvent(data, eventCtx, { pairsRepo, metaDataRepo }, results, enrichmentTasks);*/ 
