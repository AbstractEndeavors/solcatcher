// src/env/solana.ts
import { requireEnv } from './imports/index.js';
export function loadFetchConfig() {
  const out = {
    genesisSignatureFetchInterval: parseInt(requireEnv("SECONDS_BETWEEN_GENESIS_SIGNATURE_FETCH") as string,10),
    onchainMetaDataFetchInterval: parseInt(requireEnv("SECONDS_BETWEEN_ONCHAIN_METADATA_FETCH", "5") as string, 10),
  }

  
  return out
}

