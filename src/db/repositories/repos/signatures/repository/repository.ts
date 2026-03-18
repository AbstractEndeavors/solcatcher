/**
 * SIGNATURES REPOSITORY
 * 
 * Repository for account signature tracking.
 * Manages signature history and processing cursors.
 * 
 * Pattern: Explicit operations over generic abstractions
 */

import {
  type DatabaseClient,
  QueryRegistry,
  SignaturesRow,
  type AddressLike,
  type SigLike
} from './imports.js';
// ============================================================
// REPOSITORY
// ============================================================
export interface SignatureDict {
    signature:string;
    slot:number;
    err: string | null;
    memo:string | null;
    blockTime:number;
    confirmationStatus:string;
}
export class SignaturesRepository {
  constructor(readonly db: DatabaseClient) {}
  async createTable(): Promise<void> { 
    await this.db.query(QueryRegistry.CREATE_TABLE); 
    for (const indexQuery of QueryRegistry.CREATE_INDEXES) { await this.db.query(indexQuery); 

    } 
  } // ─────
  private rowToModel(row: any): SignaturesRow {
    return new SignaturesRow(
      row.account,
      row.signatures,
      row.processed_until,
      row.discovery_complete,
      row.created_at,
      row.updated_at
    );
  }

  async fetchByAccount(account: AddressLike): Promise<SignaturesRow | null> {
    const result = await this.db.query(
      QueryRegistry.FETCH_BY_ACCOUNT,
      [account]
    );

    const row = result.rows[0];
    return row ? this.rowToModel(row) : null;
  }

  async upsert(params: { account: AddressLike; signatures: SignatureDict[] }): Promise<void> {
    await this.db.query(
      QueryRegistry.UPSERT_SIGNATURES,
      [params.account, JSON.stringify(params.signatures)]
    );
  }
  async verifyInsert(account: AddressLike): Promise<SignatureDict[]> {
    const result = await this.db.query<{ signatures: SignatureDict[] }>(
      QueryRegistry.VERIFY_INSERT,
      [account]
    );

    return result.rows[0]?.signatures ?? [];
  }
  async markDiscoveryComplete(account: AddressLike): Promise<void> {
    await this.db.query(
    QueryRegistry.UPDATE_DISCOVERY_COMPLETE,
      [account]
    );
  }
  async markDiscoveryInComplete(account: AddressLike): Promise<void> {
    await this.db.query(
    QueryRegistry.UPDATE_DISCOVERY_INCOMPLETE,
      [account]
    );
  }
  async ensureAccount(account: AddressLike): Promise<void> {
    await this.db.query(QueryRegistry.ENSURE_ACCOUNT, [account]);
  }
  async updateProcessedUntil(params: {
    account: AddressLike;
    signature: SigLike;
  }): Promise<void> {
    await this.db.query(
      QueryRegistry.UPDATE_PROCESSED_UNTIL,
      [params.account, params.signature]
    );
  }

  async markGenesisSignatureComplete(
    params: {
      account:AddressLike,
      signature:SigLike
    }
  ): Promise<void> {
  await this.db.query(
    QueryRegistry.GENESIS_COMPLETE,
    [params.account, params.signature]  // ✅ $1=account, $2=signature
  );
  }
}
// ============================================================
// FACTORY (Explicit environment wiring)
// ============================================================

export function createSignaturesRepository(
  db: DatabaseClient
): SignaturesRepository {
  return new SignaturesRepository(db);
}
