// ======================
// QUERY CATEGORIZATION
// ======================

export interface QueryCategory {
  name: string;
  description: string;
  queries: Record<string, string>;
}

interface QueryRegistry {
  logdata: QueryCategory;
  metadata: QueryCategory;
  pairs: QueryCategory;
  transactions: QueryCategory;
  gettransaction: QueryCategory;
  accounts: QueryCategory;
}

export interface QueryOptions {
  retries?: number;
  throwOnEmpty?: boolean;
}

