import type {IdLike,DateLike,LimitLike,SigLike} from './../init_types.js';
import type {TransactionsRow} from './../transactions/index.js'; 
// ============================================================
// PAGINATION CURSOR (Cursor-based pagination)
// ============================================================

export class PaginationCursor {
  constructor(
    public readonly last_created_at: DateLike,
    public readonly last_id: IdLike,
    public readonly limit: LimitLike = 100,
    public readonly before?: SigLike,
  ) {
    if (limit != null && (limit as number <= 0 || limit as number > 1000)) {
      throw new Error('PaginationCursor: limit must be between 1 and 1000');
    }
  }

  get timestamp(): any {
    if (this.last_created_at){
      const date:Date = this.last_created_at as Date
      return BigInt(date.getTime());
    }
  }

  static initial(limit: number = 100): PaginationCursor {
    return new PaginationCursor(new Date(), 0, limit);
  }

  static fromTransaction(tx: TransactionsRow, limit: number = 100): PaginationCursor {
    return new PaginationCursor(tx.created_at, tx.id, limit);
  }

  next(lastTransaction: TransactionsRow): PaginationCursor {
    return new PaginationCursor(
      lastTransaction.created_at,
      lastTransaction.id,
      this.limit,
      this.before,
    );
  }
}
