import type { Commitment, AddressLike } from './../imports.js';
export declare function fetchBalance(options: {
    account: AddressLike;
    commitment?: Commitment;
}): Promise<any>;
