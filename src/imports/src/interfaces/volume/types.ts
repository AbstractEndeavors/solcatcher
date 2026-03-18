import type {IdLike,TimeRange} from './imports.js';
// ============================================================
// AGGREGATE QUERY PARAMS
// ============================================================

export class VolumeAggregateParams {
  constructor(
    public readonly pair_id: IdLike,
    public readonly time_range?: TimeRange,
    public readonly group_by?: 'hour' | 'day' | 'week' | 'month'
  ) {}
}

export class UserVolumeParams {
  constructor(
    public readonly user_address: string,
    public readonly time_range?: TimeRange
  ) {}
}
