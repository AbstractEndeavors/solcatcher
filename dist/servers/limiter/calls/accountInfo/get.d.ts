import type { Encoding, Commitment, AddressLike, IntLike, DataLike } from './../imports.js';
export declare function fetchAccountInfo(options: {
    account: AddressLike;
    commitment?: Commitment;
    encoding?: Encoding;
    offset?: IntLike;
    length?: IntLike;
    dataSlice?: DataLike;
}): Promise<any>;
