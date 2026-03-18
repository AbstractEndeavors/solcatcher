// ============================================================
// AGGREGATE QUERY PARAMS
// ============================================================
export class VolumeAggregateParams {
    pair_id;
    time_range;
    group_by;
    constructor(pair_id, time_range, group_by) {
        this.pair_id = pair_id;
        this.time_range = time_range;
        this.group_by = group_by;
    }
}
export class UserVolumeParams {
    user_address;
    time_range;
    constructor(user_address, time_range) {
        this.user_address = user_address;
        this.time_range = time_range;
    }
}
