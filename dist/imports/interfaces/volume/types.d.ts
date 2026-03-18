import type { IdLike, TimeRange } from './imports.js';
export declare class VolumeAggregateParams {
    readonly pair_id: IdLike;
    readonly time_range?: TimeRange | undefined;
    readonly group_by?: "hour" | "day" | "week" | "month" | undefined;
    constructor(pair_id: IdLike, time_range?: TimeRange | undefined, group_by?: "hour" | "day" | "week" | "month" | undefined);
}
export declare class UserVolumeParams {
    readonly user_address: string;
    readonly time_range?: TimeRange | undefined;
    constructor(user_address: string, time_range?: TimeRange | undefined);
}
