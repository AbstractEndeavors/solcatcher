import type {Commitment} from './../src/index.js';
export interface LimiterClient {
  fetchRpc(options: {
    method: string;
    params?: any;
    commitment?: Commitment;
  }): Promise<any>;
  fetchMetaData(mint: string): Promise<any>;
  getFallbackUrl(): Promise<string>;
}

