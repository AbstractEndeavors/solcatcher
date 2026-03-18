import type { IdLike, LimitLike, AddressLike } from './imports.js';
export interface DbId {
    id?: IdLike;
}
export interface DbLimit {
    limit?: LimitLike;
}
export interface DbParams extends DbId, DbLimit {
}
export interface DbAddress {
    address?: AddressLike;
}
export interface DbAccount {
    account?: AddressLike;
}
export interface FetchAccountInfoParams extends DbAccount {
}
export interface QueryResults<T = any> {
    rows: T[];
    rowCount: number;
}
