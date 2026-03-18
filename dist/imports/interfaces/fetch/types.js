import { PaginationCursor } from './../cursor/index.js';
// ============================================================
// QUERY PARAMS (Read: explicit filters)
// ============================================================
export class FetchByPairParams {
    pair_id;
    limit;
    cursor;
    constructor(pair_id, limit, cursor) {
        this.pair_id = pair_id;
        this.limit = limit;
        this.cursor = cursor;
    }
}
export class FetchByUserParams {
    user_address;
    limit;
    cursor;
    constructor(user_address, limit = 100, cursor) {
        this.user_address = user_address;
        this.limit = limit;
        this.cursor = cursor;
    }
}
export class FetchByUserAndPairParams {
    user_address;
    pair_id;
    constructor(user_address, pair_id) {
        this.user_address = user_address;
        this.pair_id = pair_id;
    }
}
export class FetchByCreatorParams {
    creator;
    limit;
    constructor(creator, limit = 100) {
        this.creator = creator;
        this.limit = limit;
    }
}
export class FetchByTimeRangeParams {
    pair_id;
    time_range;
    constructor(pair_id, time_range) {
        this.pair_id = pair_id;
        this.time_range = time_range;
    }
}
export class FetchByUserTimeRangeParams {
    user_address;
    time_range;
    constructor(user_address, time_range) {
        this.user_address = user_address;
        this.time_range = time_range;
    }
}
;
;
