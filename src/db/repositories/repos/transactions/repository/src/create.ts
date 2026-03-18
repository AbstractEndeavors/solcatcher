
// ─────────────────────────────────────────────
// SCHEMA (idempotent DDL)
// ─────────────────────────────────────────────
import { QueryRegistry } from "./../../query-registry.js";
import {TransactionsRepository} from './../TransactionsRepository.js';
export async function createTable(this: TransactionsRepository): Promise<void> {
    await this.db.query(QueryRegistry.CREATE_TABLE);
  }

export async function createIndexes(this: TransactionsRepository): Promise<void> {
    for (const ddl of QueryRegistry.CORE_INDEXES) {
      await this.db.query(ddl);
    }
  }

export async function createPotentialIndexes(this: TransactionsRepository): Promise<void> {
    for (const ddl of QueryRegistry.POTENTIAL_INDEXES) {
      await this.db.query(ddl);
    }
  }

export async function createRollupsTable(this: TransactionsRepository): Promise<void> {
    await this.db.query(QueryRegistry.CREATE_PAIR_ROLLUPS_TABLE);
  }

export async function createTmpCreatorTable(this: TransactionsRepository): Promise<void> {
    await this.db.query(QueryRegistry.CREATE_TMP_CREATOR_TABLE);
  }

export async function initSchema(this: TransactionsRepository): Promise<void> {
    await this.createTable();
    await this.createIndexes();
    await this.createRollupsTable();
  }
