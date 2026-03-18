// ============================================================
// PAGINATION CURSOR (Cursor-based pagination)
// ============================================================
export class PaginationCursor {
    last_created_at;
    last_id;
    limit;
    before;
    constructor(last_created_at, last_id, limit = 100, before) {
        this.last_created_at = last_created_at;
        this.last_id = last_id;
        this.limit = limit;
        this.before = before;
        if (limit != null && (limit <= 0 || limit > 1000)) {
            throw new Error('PaginationCursor: limit must be between 1 and 1000');
        }
    }
    get timestamp() {
        if (this.last_created_at) {
            const date = this.last_created_at;
            return BigInt(date.getTime());
        }
    }
    static initial(limit = 100) {
        return new PaginationCursor(new Date(), 0, limit);
    }
    static fromTransaction(tx, limit = 100) {
        return new PaginationCursor(tx.created_at, tx.id, limit);
    }
    next(lastTransaction) {
        return new PaginationCursor(lastTransaction.created_at, lastTransaction.id, this.limit, this.before);
    }
}
